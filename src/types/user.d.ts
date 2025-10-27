export interface User{
    username:string;
    email:string;
    password:string;
}
export interface UserLogin{
    username:string;
    password:string;
}

interface UserAuth{
    id:number;
    username:string;
    email:string;
    token:string;
}
export type { UserAuth };