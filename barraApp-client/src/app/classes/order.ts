import { Producto } from "./producto";
import { User } from "./user";

export class Order {
    private _id: number;
    private _date: Date;
    private _user: User;
    private _status: string;
    private _uuid: string;
    private _lines: OrderLine[];

    constructor(db: any = null, lines: any[] = []) {
        if (!db) {
            this._id = null;
            this._date = null;
            this._user = null;
            this._status = null;
            this._uuid = null;
            this._lines = [];
        } else {
            this.fromDB(db);
        }
        for (const line of lines) {
            this._lines.push(new OrderLine(line))
        }
        console.log(db)
        console.log(this)
    }

    public fromDB(db: any) {
        this._id = db.COM_Id;
        this._date = db.COM_TimeStamp;
        if (db.COM_IdUser) {
            db.USR_Id=db.COM_IdUser;
            this._user = new User(db);
        }
        this._status = db.COM_Status;
        this._uuid = db.COM_Uuid;
        this._lines = [];
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get date(): Date {
        return this._date;
    }

    public set date(value: Date) {
        this._date = value;
    }

    public get user(): User {
        return this._user;
    }

    public set user(value: User) {
        this._user = value;
    }

    public get status(): string {
        return this._status;
    }

    public set status(value: string) {
        this._status = value;
    }

    public get uuid(): string {
        return this._uuid;
    }

    public set uuid(value: string) {
        this._uuid = value;
    }

    public get lines(): OrderLine[] {
        return this._lines;
    }

    public set lines(value: OrderLine[]) {
        this._lines = value;
    }

    public get totalAmount(): number {
        return this._lines.reduce((amount, line) => amount + line.lineAmount, 0);
    }

    public get QRCode(): string {
        return `${this._uuid}/${this._user.id}/${this._id}`
    }

    public get deliveryPending(): number {
        return this._lines.reduce((amount, line) => amount + (line.selected? 0: line.quantity), 0)
    }

}

export class OrderLine {

    private _id: number;
    private _product: Producto;
    private _quantity: number;
    private _price: number;
    private _VAT: number;
    private _selected: boolean;

    constructor(db: any = null) {
        this._selected = false;
        if (!db) {
            this._id = null;
            this._quantity = null;
            this._price = null;
            this._VAT = null;
        } else {
            this.fromDB(db);
        }
    }

    public fromDB(db: any) {
        console.log(db)
        this._id = db.CL_Id;
        this._quantity = db.CL_Amount;
        this._price = db.CL_ProductPrice;
        this._VAT = db.CL_IVA;
        if (db.CL_IdProduct) {
            this._product = new Producto();
            this._product.id = db.CL_IdProduct;
            if (db.P_Id) this._product.fromDB(db);
        }
        console.log(this)
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get product(): Producto {
        return this._product;
    }

    public set product(value: Producto) {
        this._product = value;
    }

    public get quantity(): number {
        return this._quantity;
    }

    public set quantity(value: number) {
        this._quantity = value;
    }

    public get price(): number {
        return this._price;
    }

    public set price(value: number) {
        this._price = value;
    }

    public get VAT(): number {
        return this._VAT;
    }

    public set VAT(value: number) {
        this._VAT = value;
    }

    public get lineAmount(): number {
        return (this._price * this._quantity)
    }

	public get selected(): boolean {
		return this._selected;
	}

	public set selected(value: boolean) {
		this._selected = value;
	}

}