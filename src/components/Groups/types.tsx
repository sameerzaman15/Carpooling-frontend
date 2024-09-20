export interface ExtendedGroup {
    id: number;
    name: string;
    visibility: 'public' | 'private';
    owner: {
      id: number;
      fullName: string;
    };
    users: { id: number; fullName: string }[];
    isMember?: boolean;
    isOwner?: boolean;
    joinRequestPending?: boolean;
  }
  
  export interface JoinRequest {
    id: number;
    fullName: string;
    status: string;
  }