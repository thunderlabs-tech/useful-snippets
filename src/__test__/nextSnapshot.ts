import firebase from "firebase/compat/app";

export function nextSnapshot(
  doc: firebase.firestore.DocumentReference
): Promise<firebase.firestore.DocumentSnapshot> {
  let unsubscribe;
  return new Promise<firebase.firestore.DocumentSnapshot>((resolve, reject) => {
    unsubscribe = doc.onSnapshot({
      next: (snapshot) => {
        if (snapshot.exists) resolve(snapshot);
      },
      error: reject,
    });
  }).finally(unsubscribe);
}
