/**
 * @jest-environment node
 */
import {
  teamPath,
  teamsPath,
  userProfilePath,
} from "@connectedliving/common/lib/firestore/firestorePathBuilders";
import { Team } from "@connectedliving/common/lib/firestore/Team";
import TeamConverter from "@connectedliving/common/lib/firestore/TeamConverter";
import { assertSucceeds } from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import assertPermissionDenied from "../../__test__/assertPermissionDenied";
import describeFirestoreRules from "./__test__/describeFirestoreRules";

// This is an example provided to give the test helpers context
describeFirestoreRules(({ auth, app, unauthenticatedApp, admin }) => {
  describe("/Teams/{teamId}", () => {
    const teamId = "team-1";

    beforeEach(async () => {
      await admin(async (context) => {
        await context
          .firestore()
          .doc(teamPath({ teamId }))
          .set({ name: "Team 1" });
      });
    });

    describe("get a Team", () => {
      describe("when unauthenticated", () => {
        it("is denied", async () => {
          await assertPermissionDenied(
            unauthenticatedApp().firestore().doc(teamPath({ teamId })).get()
          );
        });
      });

      describe("by a non-team member", () => {
        it("is denied", async () => {
          await assertPermissionDenied(
            app().firestore().doc(teamPath({ teamId })).get()
          );
        });
      });

      describe("by a team member", () => {
        beforeEach(async () => {
          await admin(async (context) => {
            await context
              .firestore()
              .doc(userProfilePath({ userId: auth().uid }))
              .set({ teamIds: [teamId] });
          });
        });

        it("is allowed", async () => {
          await assertSucceeds(
            app().firestore().doc(teamPath({ teamId })).get()
          );
        });
      });
    });

    describe("list Teams", () => {
      describe("when unauthenticated", () => {
        it("is denied", async () => {
          await assertPermissionDenied(
            unauthenticatedApp().firestore().collection(teamsPath()).get()
          );
        });
      });

      describe("by a non-team member", () => {
        it("is denied", async () => {
          await assertPermissionDenied(
            app().firestore().collection(teamsPath()).get()
          );
        });
      });

      describe("by a team member", () => {
        beforeEach(async () => {
          await admin(async (context) => {
            await context
              .firestore()
              .doc(userProfilePath({ userId: auth().uid }))
              .set({ teamIds: [teamId] });
          });
        });

        it("is allowed", async () => {
          await assertSucceeds(
            app()
              .firestore()
              .collection(teamsPath())
              .where(firebase.firestore.FieldPath.documentId(), "in", [teamId])
              .get()
          );
        });
      });
    });
    describe("update Team", () => {
      describe("when not the founder", () => {
        let anotherTeam: firebase.firestore.DocumentReference<Readonly<Team>>;
        beforeEach(async () => {
          await admin(async (context) => {
            await context
              .firestore()
              .doc(teamPath({ teamId }))
              .set({ creatorId: "another-user" });
          });

          anotherTeam = app()
            .firestore()
            .doc(teamPath({ teamId }))
            .withConverter(TeamConverter);
        });
        it("is denied to update the team name", async () => {
          await assertPermissionDenied(
            anotherTeam.update({
              name: "foo",
            })
          );
        });
      });
      describe("when user is the founder", () => {
        let ownTeam: firebase.firestore.DocumentReference<Readonly<Team>>;

        beforeEach(async () => {
          await admin(async (context) => {
            await context
              .firestore()
              .doc(teamPath({ teamId }))
              .withConverter(TeamConverter)
              .set(
                {
                  creatorId: auth().uid,
                  name: "foo",
                  numberOfApartments: 100,
                  buildingParts: ["back-house", "front-house"],
                },
                { merge: true }
              );
          });
          ownTeam = app()
            .firestore()
            .doc(teamPath({ teamId }))
            .withConverter(TeamConverter);
        });
        it("is not permitted to update the team name with something other than a string", async () => {
          const notAString = false;
          await assertPermissionDenied(ownTeam.update({ name: notAString }));
        });
        it("is not permitted to update the team name with an empty field", async () => {
          await assertPermissionDenied(ownTeam.update({ name: "" }));
        });
        it("is not permitted to update the team name with only whitespace", async () => {
          await assertPermissionDenied(ownTeam.update({ name: "     " }));
        });
        it("is permitted to update the team name", async () => {
          await assertSucceeds(ownTeam.update({ name: "newName" }));
        });
        it("is permitted to update the number of apartments", async () => {
          await assertSucceeds(ownTeam.update({ numberOfApartments: 10000 }));
        });
        it("is permitted to update the building parts", async () => {
          await assertSucceeds(
            ownTeam.update({ buildingParts: ["front-house"] })
          );
        });
      });
    });
  });
});
