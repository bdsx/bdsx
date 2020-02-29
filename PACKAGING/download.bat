
call common.bat %1

mkdir bin\bds 2>NUL

echo Version: %BDS_VERSION%
IF NOT EXIST "%BDSZIP%" (
	echo %BDSZIP%: download...
	kget "https://minecraft.azureedge.net/bin-win/bedrock-server-%BDS_VERSION%.zip" "%BDSZIP%"
)

echo %BDSZIP%: unzip...
rd /s /q "%RELEASE%\server"
call unzip "%BDSZIP%" "%RELEASE%\server"
echo .>bin\bds.unziptime
