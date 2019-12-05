
call common.bat %1

rd /s /q "%RELEASE%\server"
rd /s /q "%RELEASE%\bdsx"
del "%SOLUTION%bdsx.zip" 2>NUL

echo %BDSZIP%: unzip...
call unzip "%BDSZIP%" "%RELEASE%\server"
echo bdsx: copy...
kcopy bdsx "%RELEASE%\bdsx"
echo bdsx.zip: zip...
call zip "%RELEASE%" "%SOLUTION%bdsx.zip"