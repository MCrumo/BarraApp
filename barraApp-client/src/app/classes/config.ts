export class Config {
    private _id: number;
    private _name: string;
    private _description: string;
    private _initDate: Date;
    private _endDate: Date;
    private _redsysEnabled: boolean;
    private _paypalEnabled: boolean;
    private _redsysUrl: string;
    private _redsysMerchantCode: string;
    private _redsysTerminal: string;
    private _redsysSecretKey: string;
    private _redsysNotificationUrl: string;
    private _redsysReturnUrl: string;
    private _redsysCancelUrl: string;
    private _paypalUrl: string;
    private _paypalClientId: string;
    private _paypalClientSecret: string;
    private _paypalReturnUrl: string;
    private _paypalCancelUrl: string;

    constructor(db: any = null) {
        this._id = null;
        this._name = null;
        this._description = null;
        this._initDate = null;
        this._endDate = null;
        this._redsysEnabled = false;
        this._paypalEnabled = false;
        this._redsysUrl = null;
        this._redsysMerchantCode = null;
        this._redsysTerminal = null;
        this._redsysSecretKey = null;
        this._redsysNotificationUrl = null;
        this._redsysReturnUrl = null;
        this._redsysCancelUrl = null;
        this._paypalUrl = null;
        this._paypalClientId = null;
        this._paypalClientSecret = null;
        this._paypalReturnUrl = null;
        this._paypalCancelUrl = null;
        if (db) {
            this.fromDB(db);
        }
    }

    public fromDB(db: any) {
        this._id = db.EC_Id;
        this._name = db.EC_Name;
        this._description = db.EC_Description;
        this._initDate = new Date(db.EC_InitDate);
        this._endDate = new Date(db.EC_EndDate);
        this._redsysEnabled = db.EC_RedsysEnabled;
        this._paypalEnabled = db.EC_PaypalEnabled;
        this._redsysUrl = db.EC_RedsysUrl;
        this._redsysMerchantCode = db.EC_RedsysMerchantCode;
        this._redsysTerminal = db.EC_RedsysTerminal;
        this._redsysSecretKey = db.EC_RedsysSecretKey;
        this._redsysNotificationUrl = db.EC_RedsysNotificationUrl;
        this._redsysReturnUrl = db.EC_RedsysReturnUrl;
        this._redsysCancelUrl = db.EC_RedsysCancelUrl;
        this._paypalUrl = db.EC_PaypalUrl;
        this._paypalClientId = db.EC_PaypalClientId;
        this._paypalClientSecret = db.EC_PaypalClientSecret;
        this._paypalReturnUrl = db.EC_PaypalReturnUrl;
        this._paypalCancelUrl = db.EC_PaypalCancelUrl;
    }

    public toDB() {
        return {
            EC_Id: this._id,
            EC_Name: this._name,
            EC_Description: this._description,
            EC_InitDate: this._initDate,
            EC_EndDate: this._endDate,
            EC_RedsysEnabled: this._redsysEnabled,
            EC_PaypalEnabled: this._paypalEnabled,
            EC_RedsysUrl: this._redsysUrl,
            EC_RedsysMerchantCode: this._redsysMerchantCode,
            EC_RedsysTerminal: this._redsysTerminal,
            EC_RedsysSecretKey: this._redsysSecretKey,
            EC_RedsysNotificationUrl: this._redsysNotificationUrl,
            EC_RedsysReturnUrl: this._redsysReturnUrl,
            EC_RedsysCancelUrl: this._redsysCancelUrl,
            EC_PaypalUrl: this._paypalUrl,
            EC_PaypalClientId: this._paypalClientId,
            EC_PaypalClientSecret:this._paypalClientSecret,
            EC_PaypalReturnUrl: this._paypalReturnUrl,
            EC_PaypalCancelUrl: this._paypalCancelUrl
        }
    }

    public get id(): number {
        return this._id;
    }

    public set id(value: number) {
        this._id = value;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get description(): string {
        return this._description;
    }

    public set description(value: string) {
        this._description = value;
    }

    public get initDate(): Date {
        return this._initDate;
    }

    public set initDate(value: Date) {
        this._initDate = value;
    }

    public get endDate(): Date {
        return this._endDate;
    }

    public set endDate(value: Date) {
        this._endDate = value;
    }

    public get redsysEnabled(): boolean {
        return this._redsysEnabled;
    }

    public set redsysEnabled(value: boolean) {
        this._redsysEnabled = value;
    }

    public get paypalEnabled(): boolean {
        return this._paypalEnabled;
    }

    public set paypalEnabled(value: boolean) {
        this._paypalEnabled = value;
    }

    public get redsysUrl(): string {
        return this._redsysUrl;
    }

    public set redsysUrl(value: string) {
        this._redsysUrl = value;
    }

    public get redsysMerchantCode(): string {
        return this._redsysMerchantCode;
    }

    public set redsysMerchantCode(value: string) {
        this._redsysMerchantCode = value;
    }

    public get redsysTerminal(): string {
        return this._redsysTerminal;
    }

    public set redsysTerminal(value: string) {
        this._redsysTerminal = value;
    }

    public get redsysSecretKey(): string {
        return this._redsysSecretKey;
    }

    public set redsysSecretKey(value: string) {
        this._redsysSecretKey = value;
    }

    public get redsysNotificationUrl(): string {
        return this._redsysNotificationUrl;
    }

    public set redsysNotificationUrl(value: string) {
        this._redsysNotificationUrl = value;
    }

    public get redsysReturnUrl(): string {
        return this._redsysReturnUrl;
    }

    public set redsysReturnUrl(value: string) {
        this._redsysReturnUrl = value;
    }

    public get redsysCancelUrl(): string {
        return this._redsysCancelUrl;
    }

    public set redsysCancelUrl(value: string) {
        this._redsysCancelUrl = value;
    }

    public get paypalUrl(): string {
        return this._paypalUrl;
    }

    public set paypalUrl(value: string) {
        this._paypalUrl = value;
    }

    public get paypalClientId(): string {
        return this._paypalClientId;
    }

    public set paypalClientId(value: string) {
        this._paypalClientId = value;
    }

    public get paypalClientSecret(): string {
        return this._paypalClientSecret;
    }

    public set paypalClientSecret(value: string) {
        this._paypalClientSecret = value;
    }

    public get paypalReturnUrl(): string {
        return this._paypalReturnUrl;
    }

    public set paypalReturnUrl(value: string) {
        this._paypalReturnUrl = value;
    }

    public get paypalCancelUrl(): string {
        return this._paypalCancelUrl;
    }

    public set paypalCancelUrl(value: string) {
        this._paypalCancelUrl = value;
    }

}
