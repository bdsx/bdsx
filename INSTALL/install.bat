set outdir=%~1
set config=%~2
set solutiondir=%~3

if "%config%" == "Debug" (
	set _debug=_debug
	set d=d
)

call :copydll "%UserProfile%\.bds\mods"
goto :eof

:copydll
copy "%outdir%bdsx.dll" "%~1\bdsx.dll"
copy "%outdir%bdsx.pdb" "%~1\bdsx.pdb"
copy "%outdir%libcurl%_debug%.dll" "%~1\libcurl%_debug%.dll"
copy "%outdir%libmariadb.dll" "%~1\libmariadb.dll"
copy "%outdir%zlib%d%.dll" "%~1\zlib%d%.dll"
copy "%outdir%bdsx_node.dll" "%~1\bdsx_node.dll"
copy "%solutiondir%INSTALL\vcruntime140_1.dll" "%~1\vcruntime140_1.dll"
EXIT /B 0

