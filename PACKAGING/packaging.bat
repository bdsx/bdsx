
set SOLUTION=%~1
set RELEASE=%SOLUTION%release

rd /s /q "%RELEASE%\server"
rd /s /q "%RELEASE%\bdsx"
del "%SOLUTION%bdsx.zip" 2>NUL

echo server.zip: download...
kget "https://minecraft.azureedge.net/bin-win/bedrock-server-1.13.0.34.zip" "%SOLUTION%server.zip"
echo server.zip: unzip...
call unzip "%SOLUTION%server.zip" "%RELEASE%\server"
echo bdsx: copy...
kcopy bdsx "%RELEASE%\bdsx"
echo bdsx.zip: zip...
call zip "%RELEASE%" "%SOLUTION%bdsx.zip"