import { environment } from "src/environments/environment";
import { Producto } from "./producto";

export class Familia {
    private _id: number;
    private _nombre: string;
    private _desc: string;
    private _agelimit: number;
    private _productos: Producto[];
    private _disabled: boolean;

    constructor(db: any = null) {
        this._id = null;
        this._nombre = null;
        this._desc = null;
        this._agelimit = null;
        this._productos = [];
        this._disabled = false;
        if (db) this.fromDB(db);
    }

    public fromDB(db: any) {
        this._id = db.PF_IdFamily;
        this._nombre = db.PF_Name;
        this._desc = db.PF_Description;
        this._agelimit = db.PF_AgeLimit;
        this._disabled = db.PF_Disabled ? true : false;
        this._productos = [];
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get nombre(): string {
        return this._nombre;
    }

    public set nombre(value: string) {
        this._nombre = value;
    }

    public get desc(): string {
        return this._desc;
    }

    public set desc(value: string) {
        this._desc = value;
    }

    public get agelimit(): number {
        return this._agelimit;
    }

    public set agelimit(value: number) {
        this._agelimit = value;
    }

    public get fotoUrl(): string {
        return `${environment.apiBaseUrl}/assets/images/family/${this._id}.png`;
    }

    public get productos(): Producto[] {
        return this._productos;
    }

    public set productos(value: Producto[]) {
        this._productos = value;
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    public set disabled(value: boolean) {
        this._disabled = value;
    }

}