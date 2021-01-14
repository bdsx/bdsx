import { abstract } from "bdsx/common";
import { mce } from "bdsx/mce";
import { VoidPointer } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";

export class Certificate extends NativeClass
{
	getXuid():string
	{
		abstract();
	}
	getId():string
	{
		abstract();
	}
	getIdentity():mce.UUID
	{
		abstract();
	}

	getTitleId():number
	{
		abstract();
	}
}

export class ConnectionReqeust extends NativeClass
{
	u1:VoidPointer;
	cert:Certificate;
}
