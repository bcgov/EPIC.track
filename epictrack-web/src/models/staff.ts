export interface Staff {
    id: number;
    phone: string;
    email: string;
    is_active: boolean;
    position_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    position: Position;
}

export interface Position {
    id: number;
    name: string;
}