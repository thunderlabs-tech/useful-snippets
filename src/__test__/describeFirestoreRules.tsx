import { userProfilePath } from "@connectedliving/common/lib/firestore/firestorePathBuilders";
import requireEnvVar from "@connectedliving/common/lib/utilities/requireEnvVar";
import {
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync, writeFileSync } from "fs";
import { omit } from "lodash";
import uniqueId from "lodash/uniqueId";

type FirestoreRulesTestContext = {
  auth(): { uid: string; email: string };
  app(): RulesTestContext;
  unauthenticatedApp(): RulesTestContext;
  admin(callback: (context: RulesTestContext) => Promise<void>): Promise<void>;
};

export default function describeFirestoreRules(
  tests: (context: FirestoreRulesTestContext) => void,
): void {
  let auth: { uid: string; email: string };
  let testEnvironment: RulesTestEnvironment;
  let app: RulesTestContext;
  let unauthenticatedApp: RulesTestContext;
  let admin: (
    callback: (context: RulesTestContext) => Promise<void>,
  ) => Promise<void>;

  // eslint-disable-next-line no-console
  const originalConsoleWarn = console.warn;

  describe("Firestore Security Rules (requires emulators)", () => {
    beforeAll(async () => {
      try {
        testEnvironment = await initializeTestEnvironment({
          projectId: requireEnvVar("FIREBASE_PROJECT_ID"),
          firestore: {
            rules: readFileSync("../../firestore.rules", "utf8"),
          },
        });
      } catch (e) {
        writeFileSync(
          "./error.log",
          `${(e as Error).message}
${(e as Error).stack?.toString()}`,
        );
        process.exit(1);
      }
      // eslint-disable-next-line no-console
      console.warn = (message, ...args) => {
        if (message.match(/@firebase\/firestore/)) return;
        originalConsoleWarn(message, ...args);
      };
    });

    beforeEach(async () => {
      auth = Object.freeze({
        uid: uniqueId("testUserUid-"),
        email: "test@example.com",
      });

      app = testEnvironment.authenticatedContext(auth.uid, omit(auth, "uid"));
      unauthenticatedApp = testEnvironment.unauthenticatedContext();
      admin = async (
        callback: (context: RulesTestContext) => Promise<void>,
      ) => {
        await testEnvironment.withSecurityRulesDisabled(callback);
      };
      await testEnvironment.clearFirestore();
    });

    beforeEach(async () => {
      await admin(async (context) => {
        await context
          .firestore()
          .doc(userProfilePath({ userId: auth.uid }))
          .set({ firstName: "me", lastname: "bar" });
      });
    });

    tests({
      auth: () => auth,
      app: () => app,
      unauthenticatedApp: () => unauthenticatedApp,
      admin: (callback) => admin(callback),
    });

    afterAll(async () => {
      // Frees internal resources in the Firebase library which prevent Jest from terminating
      await testEnvironment.cleanup();

      // eslint-disable-next-line no-console
      console.warn = originalConsoleWarn;
    });
  });
}
