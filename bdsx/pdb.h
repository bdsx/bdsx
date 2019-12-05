#pragma once

#include <KR3/main.h>
#include <KR3/util/callable.h>

namespace kr
{

	class PdbReader
	{
	public:
		using Callback = Lambda<sizeof(void*) * 3, bool(Text name, autoptr * address, uint32_t typeId)>;
		class GetAllCallback :public Lambda<sizeof(void*) * 3, bool(Text name, autoptr * address)>
		{
			friend PdbReader;
			using Super = Lambda<sizeof(void*) * 3, bool(Text name, autoptr * address)>;
		public:
			using Super::Super;

		private:
			PdbReader* reader;
		};

		PdbReader() noexcept;
		~PdbReader() noexcept;
		void* base() noexcept;
		void showInfo() noexcept;
		AText getTypeName(uint32_t typeId) noexcept;
		void search(const char* filter, Callback callback) noexcept;
		void getAll(GetAllCallback callback) noexcept;
		autoptr getFunctionAddress(const char* name) noexcept;

	private:
		void* m_process;
		uint64_t m_base;
	};

}
