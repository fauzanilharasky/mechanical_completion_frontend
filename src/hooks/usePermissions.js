import useUser from "@/store/useUser";
import { useMemo } from "react";

export const usePermissions = (permission_index) => {
    const { user } = useUser();

    return useMemo(() => {
        // if (!permission_index || permission_index.length === 0) return false;
        if (!user?.permissions || user.permissions.length === 0) return false;
        return permission_index.some(index => user?.permissions.includes(index));
    }, [permission_index, user?.permissions]);
};
