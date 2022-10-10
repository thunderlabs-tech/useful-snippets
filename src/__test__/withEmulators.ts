// eslint-disable-next-line import/no-extraneous-dependencies
import { withFunctionTriggersDisabled } from "@firebase/rules-unit-testing";
import firebaseAdmin from "firebase-admin";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/functions";
import "firebase/compat/storage";
import got from "got";
import { region } from "../cloudFunctionsConfig";
import { getString } from "../shared/firestore/dataHelpers";
import requireEnvVar from "../shared/utilities/requireEnvVar";
import { clearAuthEmulator, clearFirestore } from "../shared/__test__/helpers";

export type WithEmulatorsParams = {
  app: () => firebase.app.App;
  admin: () => firebaseAdmin.app.App;
  withFunctionTriggersDisabled: <T>(fn: () => T) => Promise<T>;
};

export function withEmulators(
  tests: (params: WithEmulatorsParams) => unknown
): void {
  const firebaseProjectId = requireEnvVar("FIREBASE_PROJECT_ID");
  let app: firebase.app.App;

  // The Firebase Admin SDK will look for these environment variables, if they're
  // not set it connects to the remote environment
  process.env.FIRESTORE_EMULATOR_HOST = `${requireEnvVar(
    "FIREBASE_EMULATOR_HOST"
  )}:${requireEnvVar("FIRESTORE_EMULATOR_PORT")}`;
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${requireEnvVar(
    "FIREBASE_EMULATOR_HOST"
  )}:${requireEnvVar("AUTH_EMULATOR_PORT")}`;
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${requireEnvVar(
    "FIREBASE_EMULATOR_HOST"
  )}:${requireEnvVar("STORAGE_EMULATOR_PORT")}`;
  let admin: firebaseAdmin.app.App;

  // eslint-disable-next-line no-console
  const originalConsoleInfo = console.info;
  // eslint-disable-next-line no-console
  const originalConsoleWarn = console.warn;

  beforeEach(async () => {
    // eslint-disable-next-line no-console
    console.info = (message: string, ...args) => {
      if (message.match(/WARNING: You are using the Auth Emulator/)) return;
      originalConsoleInfo(message, ...args);
    };
    // eslint-disable-next-line no-console
    console.warn = (message, ...args) => {
      if (message.match(/@firebase\/firestore: Firestore ([d.]+)/)) return;
      originalConsoleWarn(message, ...args);
    };

    const projectId = firebaseProjectId;

    app = firebase.initializeApp({
      projectId,
      apiKey: "AIza",
      storageBucket: requireEnvVar("FIREBASE_STORAGE_BUCKET"),
    });
    admin = firebaseAdmin.initializeApp({
      projectId: firebaseProjectId,
    });

    process.env.FIREBASE_CONFIG = JSON.stringify({
      databaseURL: "",
      storageBucket: requireEnvVar("FIREBASE_STORAGE_BUCKET"),
      projectId: firebaseProjectId,
    });

    const hostname = requireEnvVar("FIREBASE_EMULATOR_HOST");
    const firestoreEmulatorPort = parseInt(
      requireEnvVar("FIRESTORE_EMULATOR_PORT"),
      10
    );
    const functionsEmulatorPort = parseInt(
      requireEnvVar("FUNCTIONS_EMULATOR_PORT"),
      10
    );
    const authEmulatorPort = parseInt(requireEnvVar("AUTH_EMULATOR_PORT"), 10);
    const storageEmulatorPort = parseInt(
      requireEnvVar("STORAGE_EMULATOR_PORT"),
      10
    );

    app.storage().useEmulator(hostname, storageEmulatorPort);
    app.firestore().useEmulator(hostname, firestoreEmulatorPort);
    app.functions(region).useEmulator(hostname, functionsEmulatorPort);
    app.auth().useEmulator(`http://${hostname}:${authEmulatorPort}/`);

    await withFunctionTriggersDisabled(
      {
        host: "localhost",
        port: parseInt(getString(process.env.FIREBASE_EMULATOR_HUB_PORT), 10),
      },
      async () => {
        await clearAuthEmulator(hostname, authEmulatorPort, projectId);
        await clearFirestore(hostname, firestoreEmulatorPort, projectId);
      }
    );
  });

  afterEach(async () => {
    // eslint-disable-next-line no-console
    console.info = originalConsoleInfo;
    // eslint-disable-next-line no-console
    console.warn = originalConsoleWarn;
    await app.firestore().terminate();
    await app.delete();
    await admin.delete();
  });

  describe("(Firebase emulators required)", () => {
    tests({
      app: () => app,
      admin: () => admin,
      withFunctionTriggersDisabled: (fn) =>
        withFunctionTriggersDisabled(
          {
            host: "localhost",
            port: parseInt(requireEnvVar("FIREBASE_EMULATOR_HUB_PORT"), 10),
          },
          fn
        ),
    });
  });
}

const emulatorAuthorizationHeader = { Authorization: "Bearer owner" };

export async function clearFirestore(
  hostname: string,
  firestoreEmulatorPort: number,
  projectId: string
): Promise<void> {
  await got.delete(
    `http://${hostname}:${firestoreEmulatorPort}/emulator/v1/projects/${projectId}/databases/(default)/documents`,
    { headers: { ...emulatorAuthorizationHeader } }
  );
}

export async function clearAuthEmulator(
  hostname: string,
  authEmulatorPort: number,
  projectId: string
): Promise<void> {
  await got.delete(
    `http://${hostname}:${authEmulatorPort}/emulator/v1/projects/${projectId}/accounts`,
    { headers: { ...emulatorAuthorizationHeader } }
  );
}
