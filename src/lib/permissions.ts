export enum PERMISSIONS {
    NONE = 0,
    CREATE_POST = 1 << 0,
    EDIT_POST = 1 << 1,
    DELETE_POST = 1 << 2,
    ADMIN = 1 << 3,
}

export const PermsManager = {
    combine(...perms: number[]) {
        return perms.reduce((total, perm) => total | perm, 0)
    },

    has(userPerms: number, reqPerms: number) {
        if ((userPerms & PERMISSIONS.ADMIN) === PERMISSIONS.ADMIN) return true;
        return (userPerms & reqPerms) === reqPerms;
    }
}