import { abstract, RawTypeId } from "bdsx/common";
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
		abstract();
	}
}
const getXuid = makefunc.js(proc["ExtendedCertificate::getXuid"], CxxStringPointer, {structureReturn: true}, Certificate);
const getIdentityName = makefunc.js(proc["ExtendedCertificate::getIdentityName"], CxxStringPointer, {structureReturn: true}, Certificate);
Certificate.prototype.getTitleId = makefunc.js(proc["ExtendedCertificate::getTitleID"], RawTypeId.Int32, {this:Certificate});
const getIdentity = makefunc.js(proc["ExtendedCertificate::getIdentity"], mce.UUIDPointer, {structureReturn: true}, Certificate);

export class ConnectionReqeust extends NativeClass
{
	u1:VoidPointer;
	cert:Certificate;
}
ConnectionReqeust.abstract({
	u1: VoidPointer,
	cert:Certificate
});
