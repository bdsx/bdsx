import { RawTypeId } from "bdsx/common";
import { mce } from "bdsx/mce";
import { makefunc, VoidPointer } from "bdsx/core";
import { NativeClass } from "bdsx/nativeclass";
import { CxxStringPointer } from "bdsx/pointer";
import { proc } from "./proc";

export class Certificate extends NativeClass
{
	getXuid():string
	{
		const out = getXuid(this);
		const xuid = out.p;
		out.destruct();
		return xuid;
	}
	getId():string
	{
		const out = getIdentityName(this);
		const id = out.p;
		out.destruct();
		return id;
	}
	getIdentity():mce.UUID
	{
		return getIdentity(this).p;
	}

	getTitleId():number
	{
		throw 'abstract';
	}
}
const getXuid = makefunc.js(proc["ExtendedCertificate::getXuid"], CxxStringPointer, null, true, Certificate);
const getIdentityName = makefunc.js(proc["ExtendedCertificate::getIdentityName"], CxxStringPointer, null, true, Certificate);
Certificate.prototype.getTitleId = makefunc.js(proc["ExtendedCertificate::getTitleID"], RawTypeId.Int32, Certificate, false);
const getIdentity = makefunc.js(proc["ExtendedCertificate::getIdentity"], mce.UUIDPointer, null, true, Certificate);

export class ConnectionReqeust extends NativeClass
{
	u1:VoidPointer;
	cert:Certificate;
}
ConnectionReqeust.abstract({
	u1: VoidPointer,
	cert:Certificate
});
