import { environment } from "src/environments/environment";

export class Producto {
    private _id: number;
    private _idPF: number;
    private _nombre: string;
    private _desc: string;
    private _price: number;
    private _iva: number;
    private _disabled: boolean;

    constructor(db: any = null) {
        if (!db) {
            this._id = null;
            this._idPF = null;
            this._nombre = null;
            this._price = null;
            this._desc = null;
            this._disabled = false;
            this._iva = null;
        } else {
            this.fromDB(db);
        }
    }

    public fromDB(db: any) {
        this._id = db.P_Id;
        this._idPF = db.P_IdProductFamily;
        this._nombre = db.P_Name;
        this._desc = db.P_Description;
        this._price = db.P_Price;
        this._iva = db.P_IVA;
        this._disabled = db.P_Disabled;
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get idPF(): number {
        return this._idPF;
    }

    public set idPF(value: number) {
        this._idPF = value;
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

    public get price(): number {
        return this._price;
    }

    public set price(value: number) {
        this._price = value;
    }
    public get iva(): number {
        return this._iva;
    }

    public set iva(value: number) {
        this._iva = value;
    }

    public get fotoUrl(): string {
        return `${environment.apiBaseUrl}/assets/images/product/${this._id}.png`;
    }

    public get disabled(): boolean {
        return this._disabled;
    }

    public set disabled(value: boolean) {
        this._disabled = value;
    }

}
