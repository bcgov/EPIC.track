export interface Project {
    id: number;
    type:string;
    subtype:string;
    is_active: boolean;
    position_id: number;
    project_name: string;
    position: Position;
}

export interface Position {
    id: number;
    name: string;
}