#pragma once

#include <stdint.h>
#include <KR3/main.h>

inline kr::autoptr make_pointer(uint32_t low, uint32_t high) noexcept
{
	return (void*)kr::makeqword(low, high);
}
