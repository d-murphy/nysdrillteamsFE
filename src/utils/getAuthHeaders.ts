import { useAuth } from "react-oidc-context";



export function getAuthHeaders(auth: ReturnType<typeof useAuth>): Record<string, string> {

    const accessToken = auth.user?.access_token;
    const idToken = auth.user?.id_token;
    if(!accessToken || !idToken){
        throw new Error("No access token or id token found");
    }
    return {
        'Authorization': `Bearer ${accessToken}`,
        'X-Id-Token': idToken
    }
}
