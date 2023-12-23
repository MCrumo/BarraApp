export class User {
    private _id: number;
    private _email: string;
    private _role: string;
    private _name: string;
    private _surname1: string;
    private _surname2: string;
    private _birthDate: Date;
    private _verified: boolean;
    private _balance: number;

    constructor(db: any = null) {
        this._id = null;
        this._email = null;
        this._role = null;
        this._name = null;
        this._surname1 = null;
        this._surname2 = null;
        this._birthDate = null;
        this._verified = false;
        this._balance = 0;
        if (db) {
            this.fromDB(db);
        }
    }

    public fromDB(db: any) {
        this._id = db.USR_Id;
        this._email = db.USR_Email;
        this._role = db.USR_Role;
        this._name = db.USR_Name;
        this._surname1 = db.USR_Surname1;
        this._surname2 = db.USR_Surname2;
        this._birthDate = new Date(db.USR_BirthDate);
        this._verified = db.USR_Verified ? true : false;
        this._balance = db.USR_Balance;
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get email(): string {
        return this._email;
    }

	public set email(value: string) {
		this._email = value;
	}

    public get role(): string {
        return this._role;
    }

	public set role(value: string) {
		this._role = value;
	}

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get surname1(): string {
        return this._surname1;
    }

    public set surname1(value: string) {
        this._surname1 = value;
    }

    public get surname2(): string {
        return this._surname2;
    }

    public set surname2(value: string) {
        this._surname2 = value;
    }

	public get birthDate(): Date {
		return this._birthDate;
	}

	public set birthDate(value: Date) {
		this._birthDate = value;
	}

	public get verified(): boolean {
		return this._verified;
	}

	public set verified(value: boolean) {
		this._verified = value;
	}

	public get balance(): number {
		return this._balance;
	}

	public set balance(value: number) {
		this._balance = value;
	}

	public get fullName(): string {
		return `${this._name} ${this._surname1} ${this._surname2}`;
	}

    public get age(): number {
        const today = new Date();
        const birthDate = new Date(this._birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
    
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    
        return age;
    }
    
}
