export default interface SecretModel{
    type: string;
    account: string;
    secret: string;
    issuer?: string;
    algorithm?: string;
    digits?: number;
    period?: number;
    name: string;
    created_date: string;
    id: number;
    last_modified_date: string;
    logo: string;
    user_identifier: string;
}