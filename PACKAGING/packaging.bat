
call common.bat %1

rd /s /q "%RELEASE%\server"
rd /s /q "%RELEASE%\bdsx"
del "%PUBLISH%" 2>NUL

echo|set /p=%BDSX_VERSION%>%RELEASE%\bin\VERSION
echo %BDSZIP%: unzip...
call unzip "%BDSZIP%" "%RELEASE%\server"
echo bdsx: copy...
kcopy bdsx "%RELEASE%\bdsx"
kcopy ..\bin\x64\Debug\predefined "%RELEASE%\bin\predefined"
echo bdsx.zip: zip...
call zip "%RELEASE%" "%%PUBLISH%%"