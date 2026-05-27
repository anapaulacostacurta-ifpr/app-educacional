const userService = {
    findByUid: async (uid) => {
        return await firebase.firestore()
            .collection("users")
            .doc(uid)
            .get()
            .then(doc => {
                return doc.data();
            });
    },
    getHosts: async () => {
        const querySnapshot = await firebase.firestore()
            .collection("users")
            .where('profile','==',"host")
            .where('state','==',true)
            .get();

            if(querySnapshot.empty){
                throw new Error("01 - Não encontrado.");
            }
            const hosts = querySnapshot.docs.map(doc=>doc.data());
            console.log(hosts);            
            return  hosts;
    },
    getPlayers: async (host) => {
        const querySnapshot = await firebase.firestore()
            .collection("users")
            .where('profile','==',"player")
            .where('host','==',host)
            .get();

            if(querySnapshot.empty){
                throw new Error("01 - Não encontrado.");
            }
            const players = querySnapshot.docs.map(doc=>doc.data());
            console.log(players);            
            return players;
    },
    save: async (id,user) => {
        try{
            const querySnapshot = await firebase.firestore()
            .collection("users")
            .doc(id)
            .set(user);

            return querySnapshot;
        }catch (error) {
            throw error;
        }
    },
    update: async (id, user) => {
        return await firebase.firestore()
            .collection("users")
            .doc(id)
            .update(user);
    },
};