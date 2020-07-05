#include "codewrite.h"
#include "console.h"

using namespace kr;
using namespace hook;

TmpArray<pair<size_t, size_t>> memdiff(const void* _src, const void* _dst, size_t size) noexcept
{
	byte* src = (byte*)_src;
	byte* src_end = (byte*)_src + size;
	byte* dst = (byte*)_dst;

	TmpArray<pair<size_t, size_t>> diff;
	pair<size_t, size_t>* last = nullptr;

	for (; src != src_end; src++, dst++)
	{
		if (*src == *dst)
		{
			if (last == nullptr) continue;
			last->second = src - (byte*)_src;
			last = nullptr;
		}
		else
		{
			if (last != nullptr) continue;
			last = diff.prepare(1);
			last->first = src - (byte*)_src;
		}
	}
	if (last != nullptr) last->second = size;
	return diff;
}
bool memdiff_contains(View<pair<size_t, size_t>> larger, View<pair<size_t, size_t>> smaller) noexcept
{
	auto* small = smaller.begin();
	auto* small_end = smaller.end();

	for (auto large : larger)
	{
		for (;;)
		{
			if (small == small_end) return true;

			if (small->first < large.first) return false;
			if (small->first > large.second) break;
			if (small->first == large.second) return false;
			if (small->second > large.second) return false;
			if (small->second == large.second)
			{
				small++;
				break;
			}
			small++;
		}
	}
	return true;
}
bool checkCode(kr::Text name, void* code, size_t offset, Buffer originalCode, View<pair<size_t, size_t>> skip) noexcept
{
	TmpArray<pair<size_t, size_t>> diff = memdiff((byte*)code+offset, originalCode.data(), originalCode.size());
	if (skip == nullptr)
	{
		if (diff.empty()) return true;
	}
	else
	{
		if (memdiff_contains(skip, diff)) return true;
	}

	Console::ColorScope _color = FOREGROUND_RED | FOREGROUND_INTENSITY;
	TSZ out;
	out << "[BDSX] " << name << "+0x" << hexf(offset) << " - function hooking failed, bytes did not matched at {";
	for (pair<size_t, size_t>& v : diff)
	{
		out << " {" << v.first << ", " << v.second << "}, ";
	}
	out << "}\n";
	console.logA(out);
	return false;
}


Code::Code(size_t size) noexcept
	:CodeWriter(ExecutableAllocator::getInstance()->alloc(size), size)
{
	m_codeptr = end();
	memset(m_codeptr, 0xcc, 64);
}
void Code::hook(kr::Text name, void* from, void* to, kr::Buffer originalCode, View<std::pair<size_t, size_t>> skip) noexcept
{
	size_t size = originalCode.size();
	Unprotector unpro(from, size);
	if (!checkCode(name, from, 0, originalCode, skip)) return;

	Code hooker(64 + size);
	hooker.push(RCX);
	hooker.push(RDX);
	hooker.push(R8);
	hooker.push(R9);
	hooker.sub(RSP, 0x28);
	hooker.call(to, RAX);
	hooker.add(RSP, 0x28);
	hooker.pop(R9);
	hooker.pop(R8);
	hooker.pop(RDX);
	hooker.pop(RCX);
	hooker.write(originalCode.cast<byte>());
	hooker.jumpWithoutTemp((byte*)from + size);

	{
		CodeWriter writer((void*)unpro, size);
		writer.jump(hooker.m_codeptr, RAX);
	}
}
void Code::nopping(kr::Text name, void* base, size_t offset, kr::Buffer originalCode, kr::View<std::pair<size_t, size_t>> skip) noexcept
{
	size_t codeSize = originalCode.size();
	Unprotector unpro((byte*)base + offset, codeSize);
	if (!checkCode(name, base, offset, originalCode, skip)) return;
	CodeWriter code((void*)unpro, codeSize);
	code.fillNop();
}
void Code::patchTo(kr::Text name, void* base, size_t offset, Buffer originalCode, kr::hook::Register tempregister, bool jump, View<pair<size_t, size_t>> skip) noexcept
{
	if (base == nullptr)
	{
		console.logA(TSZ() << "[BDSX] " << name << "+0x" << hexf(offset) << " - skipped, junction point not found");
		return;
	}
	size_t size = originalCode.size();
	Unprotector unpro((byte*)base + offset, size);
	if (!checkCode(name, base, offset, originalCode, skip)) return;

	CodeWriter writer((void*)unpro, size);
	if (jump) writer.jump(m_codeptr, tempregister);
	else writer.call(m_codeptr, tempregister);
	writer.fillNop();
}
void Code::patchToBoolean(kr::Text name, void* base, size_t offset, kr::hook::Register testregister, void* jumpPoint, Buffer originalCode, kr::hook::Register tempregister) noexcept
{
	if (base == nullptr) return;
	size_t size = originalCode.size();
	Unprotector unpro((byte*)base + offset, size);
	if (!checkCode(name, base, offset, originalCode)) return;

	CodeWriter writer((void*)unpro, size);
	writer.call(m_codeptr, tempregister);
	writer.test(testregister, testregister);
	writer.jz(intact<int32_t>((byte*)jumpPoint - (byte*)writer.end() - 6));
	writer.fillNop();
}

ModuleInfo::ModuleInfo() noexcept
	:m_currentModule(GetModuleHandleW(nullptr))
{
}
ModuleInfo::~ModuleInfo() noexcept
{
}

autoptr ModuleInfo::operator ()(intptr_t offset) noexcept
{
	return (byte*)m_currentModule + offset;
}