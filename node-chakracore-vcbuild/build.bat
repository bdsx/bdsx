
set projdir=%~1
set config=%~2
set outdir=%~3
set mode=%~4

if "%config%" == "Debug" set config_low=debug
if "%config%" == "Release" set config_low=release

SET ncdir=%projdir%..\node-chakracore\
for %%i in ("%ncdir%") do SET "ncdir=%%~fi"
set nodelib=%ncdir%%config%\node.lib
set nodedll=%ncdir%%config%\node.dll

if "%mode%" neq "" goto %mode%

:build
if exist "%nodelib%" if exist "%nodedll%"  (
	echo %nodelib%: EXIST
	goto :post-build
)
call "%ncdir%vcbuild.bat" vs2019 dll %config_low%
goto post-build

:clean
call "%ncdir%vcbuild.bat" vs2019 dll clean %config_low%
goto :EOF

:rebuild
call "%ncdir%vcbuild.bat" vs2019 dll clean %config_low%
call "%ncdir%vcbuild.bat" vs2019 dll %config_low%
goto post-build

:post-build
echo copy "%nodedll%" "%outdir%node.dll"
copy "%nodedll%" "%outdir%node.dll" >nul 2>&1
copy "%nodedll%" "%userprofile%\.bds\mods\node.dll" >nul 2>&1
goto :EOF
