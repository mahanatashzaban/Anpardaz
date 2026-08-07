this is my api key of kavehnegar for otp soce. user should be able to register and sign in by entry code which kevehnegar send for them i am first user to test. "3876794761642F4E4566617A634B386D5735396E485A653275513341446773644D4171677134724358476B3D". i upload my all project frontend and backend for you, you prepare my codes to run it on vps by ip 78.157.51.76. i got this toturial from kevehnegar to set sms of otp for app "کد ارسال و دریافت پیامک
کیت توسعه نرم‌افزار یا SDK ، مجموعه ای از توابع و کتابخانه‌های کامپایل شده‌ای است که برای آسان کردن برنامه‌نویسی در اختیار توسعه دهندگان قرار می‌ گیرد. شرکت کاوه نگار بعد از انتشار وب سرویس پیامک REST و SOAP اقدام به تولید SDK برای زبان های برنامه نویسی محبوب نمود تا گسترش دهندگان نرم افزار بتوانند به راحتی با افزودن یک کتابخانه به پروژه خود از سرویس کاوه نگار در هر پروژه ها استفاده نمایند.

در صورتی که در اجرای هر کدام از متدها مشکلی وجود داشته باشد Exception ارسال می‌شود ، که شما می‌توانید با استفاده از آن خطا موجود را شناسایی کنید.
ApiException : به این معنی است که ارتباط با وب سرویس امکان پذیر بوده و خطایی از آن دریافت کرده است ( لیست خطاها به همراه توضیحات )
HttpException : به این معنی است که مشکلی در برقراری ارتباط با سرویس کاوه نگار وجود دارد

کد ارسال پیامک کاوه نگار بر مبنای وب سرویس پیامک REST می‌باشد، بنابراین در صورت تمایل به دریافت جزئیات بیشتر می‌توانید به مستندات وب سرویس Rest مراجعه نمائید. توابع موجود در SDK شامل ارسال پیامک سریع ، ارسال پیامک گروهی ، دریافت وضعیت پیامک های ارسال ،ارسال کد اعتبارسنجی پیامک و تماس تلفنی، واکشی پیامک های دریافتی و گزارشات مربوط به میزان ارسال و دریافت پیامک می‌باشد .

برای ارائه مشکلات و یا پیشنهادات خود در رابطه با SDK می‌توانید از طریق ایمیل support@kavenegar.com آن را به ما منتقل کنید و یا از طریق یک Push Request در کانال گیت هاب ما را مطلع نمائید .

در صورتی که در گیت هاب حساب کاربری دارید خوشحال میشویم کاوه نگار را دنبال نمائید.

C#
برای استفاده از SDK کاوه نگار در زبان های دات نت کافی است فایل DLL دانلود شده را به بخش Refrence های پروژه اضافه نمائید.

نصب
برای نصب کافیست مراحل زیر را طی کنید

روش اول
nuget را از اینجا دانلود و نصب نمائید(اگر Visual Studio 2017 به بعد استفاده میکنید، نیازی به نصب جداگانه nuget ندارید.)
ازمنوی Tools قسمت Nuget Package Manager گزینه Package Manager Console را انتخاب نمائید
از Package Manager Console باز شده دستور Install-Package Kavenegar را تایپ نمائید و سپس اینتر را بزنید
اکنون پکیج Kavenegar.dll به References های پروزه اضافه شده که از بخش Solution explorer پوشه References قابل مشاهده میباشد
روش دوم
بصورت دستی آخرین نسخه پکیج را از اینجا دانلود نمائید
بر روی فایل Sln در قسمت Solution Explorer کلیک راست کنید و روی گزینه Add و سپس گزینه Existing Project کلیک نمایید و فایل csproj فایل دانلود شده را انتخاب و Add کنید.
نمونه کد ارسال پیامک
try {
 Kavenegar.KavenegarApi api = new Kavenegar.KavenegarApi("Your Api Key");
 var result = api.Send("SenderLine", "Your Receptor", "خدمات پیام کوتاه کاوه نگار");
 foreach(var r in result) {
  Console.Write("r.Messageid.ToString()");
 }
} catch (Kavenegar.Exceptions.ApiException ex) {
 // در صورتی که خروجی وب سرویس 200 نباشد این خطارخ می دهد.
 Console.Write("Message : " + ex.Message);
} catch (Kavenegar.Exceptions.HttpException ex) {
 // در زمانی که مشکلی در برقرای ارتباط با وب سرویس وجود داشته باشد این خطا رخ می دهد
 Console.Write("Message : " + ex.Message);
}
با توجه به قابلیت استفاده از پکیج dotnet در dotnet Standard میتوانید از قابلیت متدهای Async نیز استفاده نمایید.
 

.Net Core
برای استفاده از پکیج وب سرویس کاوه نگار در Net Core. می توانید یکی از روش های زیر را انتخاب نمایید.

نصب
برای نصب کافیست مراحل زیر را طی کنید

روش اول
nuget را از اینجا دانلود و نصب نمائید(اگر Visual Studio 2017 به بعد استفاده میکنید، نیازی به نصب جداگانه nuget ندارید.)
ازمنوی Tools قسمت Nuget Package Manager گزینه Package Manager Console را انتخاب نمائید
از Package Manager Console باز شده دستور Install-Package KavenegarDotNetCore را تایپ نمائید و سپس اینتر را بزنید
اکنون پکیج KavenegarDotNetCore به Pakages های پروژه اضافه شده که از بخش Solution explorer پوشه Dependencies قابل مشاهده میباشد
روش دوم
بصورت دستی آخرین نسخه پکیج را از اینجا دانلود نمائید
بر روی فایل Sln در قسمت Solution Explorer کلیک راست کنید و روی گزینه Add و سپس گزینه Existing Project کلیک نمایید و فایل csproj فایل دانلود شده را انتخاب و Add کنید.
روش سوم
با رفتن به بخش Edit Project File (کلیک راست روی پروژه و انتخاب گزینه Edit Project File در قسمت Solution explorer )
در تگ <ItemGroup> مقدار زیر را وارد نمایید و فایل را Save کنید.
<PackageReference Include="KavenegarDotNetCore" Version="1.0.1" />
روش چهارم
با استفاده از Command Line در Root پروژه و اجرا کردن دستور زیر
dotnet add package KavenegarDotNetCore --version 1.0.1
نمونه کد ارسال پیامک
try {
 Kavenegar.KavenegarApi api = new Kavenegar.KavenegarApi("Your Api Key");
 var result = api.Send("SenderLine", "Your Receptor", "خدمات پیام کوتاه کاوه نگار");
 foreach(var r in result) {
  Console.Write("r.Messageid.ToString()");
 }
} catch (Kavenegar.Exceptions.ApiException ex) {
 // در صورتی که خروجی وب سرویس 200 نباشد این خطارخ می دهد.
 Console.Write("Message : " + ex.Message);
} catch (Kavenegar.Exceptions.HttpException ex) {
 // در زمانی که مشکلی در برقرای ارتباط با وب سرویس وجود داشته باشد این خطا رخ می دهد
 Console.Write("Message : " + ex.Message);
}
با استفاده از پکیج Core می توانید متدهای Async را نیز استفاده نمایید.
 

PHP
برای استفاده از SDK کاوه نگار در زبان PHP کافیست فایل فشرده که حاوی کدهای ارسال و دریافت پیامک می‌باشد را دانلود و از حالت فشرده خارج نموده و در کنار کدهای خود قرار دهید. ضمنا Include SDK کاوه نگار را در قسمتی که می‌خواهید توابع را فراخوانی کنید فراموش نشود.

شما به عنوان برنامه نویس و توسعه دهنده وظیفه قرار دادن کد مناسب با سیستم خود را در این کلاس دارید. برای مثال شما مایل هستید بعد از ایجاد خطا, متن و اطلاعات پشته خطا در فایلی ذخیره و سپس پیام مناسب به کلاینت نمایش داده شود.

نصب
دستور زیر را اجرا کنید

composer require kavenegar/php
یا خط زیر را به فایل composer.json اضافه کنید

"kavenegar/php": "*"
و سپس دستور زیر را بزنید

composer update
نمونه کد
require  '/vendor/autoload.php';
$sender = "20006535";
$receptor = "09*********";
$message = "وب سرویس تخصصی کاوه نگار ";
$api = new \Kavenegar\KavenegarApi("ِYour API Key");
$api->Send($sender,$receptor,$message);
catch(\Kavenegar\Exceptions\ApiException $e){
        // در صورتی که خروجی وب سرویس 200 نباشد این خطا رخ می دهد
        echo $e->errorMessage();
}
catch(\Kavenegar\Exceptions\HttpException $e){
        // در زمانی که مشکلی در برقرای ارتباط با وب سرویس وجود داشته باشد این خطا رخ می دهد
        echo $e->errorMessage();
}
 

Java
نصب
بسته به آنچه که استفاده میکنید

gradle
ابتدا مخزن jitpck را به پروژه خود اضافه میکنید

allprojects {
    repositories {
        maven { url 'https://jitpack.io' }
    }
}
سپس dependency ها را اضافه میکنید

dependencies {
    compile 'com.github.kavenegar:kavenegar-java:v2.0.1'
}
maven
ابتدا مخزن jitpck را به پروژه خود اضافه میکنید

<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
سپس dependency ها را اضافه میکنید

<dependency>
    <groupId>com.github.kavenegar</groupId>
    <artifactId>kavenegar-java</artifactId>
    <version>v2.0.1</version>
</dependency>
sbt
ابتدا مخزن jitpck را به پروژه خود اضافه میکنید

resolvers += "jitpack" at "https://jitpack.io"
سپس dependency ها را اضافه میکنید

libraryDependencies += "com.github.kavenegar" % "kavenegar-java" % "v2.0.1"
نمونه کد ارسال پیامک
try {
     KavenegarApi  api= new KavenegarApi("");
      SendResult Result = api.send("SenderLine", "Your Receptor", "خدمات پیام کوتاه کاوه نگار");
}
catch (HttpException ex)
{ // در صورتی که خروجی وب سرویس 200 نباشد این خطارخ می دهد.
  System.out.print("HttpException  : " + ex.getMessage());
}
catch (ApiException ex)
{ // در صورتی که خروجی وب سرویس 200 نباشد این خطارخ می دهد.
   System.out.print("ApiException : " + ex.getMessage());
}
 

Delphi
با توجه آنکه Parser ساختار Json در دلفی نسخه 2011 به بالا وجود دارد استفاده از SDK در نسخه های 2011 و بالاتر توصیه می‌شود در صورتی که شما از نسخه های پایین تر استفاده می کنید توصیه می‌شود از راهنمای SOAP استفاده نمائید.

نصب
برای استفاده از SDK کاوه نگار در زبان دلفی ، کافی است که فایل مورد نظر را را دانلود کرده و به بخش کتابخانه های پروژه اضافه کنید.

توجه : این نسخه از SDK برای دلفی 2011 و بالاتر مناسب می‌باشد , در صورتی که شما از نسخه های پائین تر استفاده می کنید لطفا به صفحهراهنمای SOAP مراجعه نمائید تا نسخه مناسب با دلفی 6 و 7 را دریافت کنید.

 

Curl
خب میتونید از طریق دستور زیر توسط curl پیام خود را ارسال کنید :

نمونه کد ارسال پیامک
curl -XPOST http://api.kavenegar.com/v1/{API-KEY}/sms/send.json \
    --data-urlencode "receptor={Your Phone Number}"  \
    --data-urlencode "sender=20006535"  \
    --data-urlencode "message=  وب سرویس تخصصی کاوه نگار  "  \
NodeJS
نصب
برای نصب کافی است که Nodejs SDK کاوه نگار را از طریق npm به صورت زیر نصب کنید

npm install kavenegar
اگر npm را در سیستم خود نصب ندارید به راحتی آن را از طریق لینک زیر نصب کنید
دانلود و نصب npm

نمونه کد ارسال پیامک
var Kavenegar = require('kavenegar');
var api = Kavenegar.KavenegarApi({
    apikey: '"{Your API Key}'
});
api.Send({
        message: "وب سرویس تخصصی کاوه نگار",
        sender: "20006535",
        receptor: "09*********"
    },
        function(response, status) {
        console.log(response);
        console.log(status);
    });
 

Python
نصب
pip install kavenegar
نمونه کد ارسال پیامک
#!/usr/bin/env python
from kavenegar import *
try:
        import json
except ImportError:
        import simplejson as json
try:
    api = KavenegarAPI('{Your APIKey}')
    params = {
        'sender': '20006535',
        'receptor': '{Your Phone Number}',
        'message': 'Kaveh specialized Web service '
    }   
    response = api.sms_send(params)
        print str(response)
except APIException,e: 
        print str(e)
except HTTPException,e: 
        print str(e)
 

Go
نصب
go get github.com/kavenegar/kavenegar-go 
نمونه کد ارسال پیامک
package main
import (
	"fmt"
	"net/url"
	"github.com/kavenegar/kavenegar-go"
)
func main() {
	api := kavenegar.New(" your apikey ")
	sender := "20006535"                 
	receptor := []string{"", ""}
	message := "Hello Go!" 
	if res, err := api.Message.Send(sender, receptor, message, nil); err != nil {
		switch err := err.(type) {
		case *kavenegar.APIError:
			fmt.Println(err.Error())
		case *kavenegar.HTTPError:
			fmt.Println(err.Error())
		default:
			fmt.Println(err.Error())
		}
	} else {
		for _, r := range res {
			fmt.Println("MessageID 	= ", r.MessageID)
			fmt.Println("Status    	= ", r.Status)
			//...
		}
	}
}
Ruby
نصب
این خط را به فایل gem اپلیکشن خود اضافه کنید

gem 'kave'
سپس دستور زیر را اجرا کنید

$ bundle install
یا آن را به طور کلی از طریق gem نصب کنید

$ gem install kave
و initfile را در دایرکتوری کانفیگ خود بسازیذ (kave.rb)

Kave.configure do |config|
  config.wsdl ='http://api.kavenegar.com/soap/v1.asmx?WSDL'
  config.sender  = '20006535'
نمونه کد ارسال پیامک
request=Kave::SendRequestSimple.new({
        message: 'خدمات پیام کوتاه کاوه نگار',
        mobile: '09361234567 ',
        #optional
        unixdate: by default 0 ,
        msgmode: by default 1
})
res=request.call
render :text=>{status_message_only_farsi: res.statusmessage,status_code: res.status}
Laravel
نصب
دستور زیر را اجرا کنید

composer require kavenegar/laravel
یا خط زیر را به فایل composer.json اضافه کنید

"kavenegar/laravel": "*"
و سپس دستور زیر را بزنید

composer update
تنظیمات
Laravel 5
به آرایه providers در config/app.php در مسیر Kavenegar\Laravel\ServiceProvider کد های زیر را اضافه کنید

'providers' => [
    Kavenegar\Laravel\ServiceProvider::class,
],
کد زیر را به آرایه aliases اضافه کنید

'aliases' => [
    'Kavenegar' => Kavenegar\Laravel\Facade::class,
],
و در اخر فایل کانفیگ را با دستور زیر publish کنید

php artisan vendor:publish
درآخر آن را در مسیر config/kavenegar.php پیدا خواهید کرد
Laravel 4
به آرایه providers در config/app.php در مسیر Kavenegar\Laravel\ServiceProvider کد های زیر را اضافه کنید

'providers' => [
    Kavenegar\Laravel\ServiceProvider,
],
کد زیر را به آرایه aliases اضافه کنید

'aliases' => [
    'Kavenegar' => Kavenegar\Laravel\Facade,
],
و در اخر فایل کانفیگ را با دستور زیر publish کنید

php artisan vendor:publish
درآخر آن را در مسیر config/kavenegar.php پیدا خواهید کرد
نمونه کد ارسال پیامک
use Kavenegar;
try{
    $sender = "20006535";
    $message = "خدمات پیام کوتاه کاوه نگار";
    $receptor = array("09*********","09*********");
    $result = Kavenegar::Send($sender,$receptor,$message);
    if($result){
        foreach($result as $r){
            echo "messageid = $r->messageid";
            echo "message = $r->message";
            echo "status = $r->status";
            echo "statustext = $r->statustext";
            echo "sender = $r->sender";
            echo "receptor = $r->receptor";
            echo "date = $r->date";
            echo "cost = $r->cost";
        }       
    }
}
catch(\Kavenegar\Exceptions\ApiException $e){
    // در صورتی که خروجی وب سرویس 200 نباشد این خطا رخ می دهد
    echo $e->errorMessage();
}
catch(\Kavenegar\Exceptions\HttpException $e){
    // در زمانی که مشکلی در برقرای ارتباط با وب سرویس وجود داشته باشد این خطا رخ می دهد
    echo $e->errorMessage();
}
 

Yii
نصب
دستور زیر را اجرا کنید

composer require kavenegar/yii2
یا خط زیر را به فایل composer.json اضافه کنید

"kavenegar/yii2": "*"
و سپس دستور زیر را بزنید

composer update
تنظیمات
تیکه کد زیر را به کانفیگ برنامه خود اضافه کنید

return [
            'components' => [
            'Kavenegar' => [
            'class' => 'Kavenegar\Yii2\Kavenegar',
            'apikey' => '{Your API Key}',
        ],
    ],
];
نمونه کد ارسال پیامک

try{
    $api = Yii::$app->Kavenegar->KavenegarApi();
    $sender = "20006535";
    $message = "Kaveh specialized Web service ";
    $receptor = array("{Your Phone Number} ");
    $result = $api->Send($sender,$receptor,$message);
            if($result){
            foreach($result as $r){
            echo "messageid = $r->messageid";
            echo "message = $r->message";
            echo "status = $r->status";
            echo "statustext = $r->statustext";
            echo "sender = $r->sender";
            echo "receptor = $r->receptor";
            echo "date = $r->date";
            echo "cost = $r->cost";
        }       
    }
}
catch(\Kavenegar\Exceptions\ApiException $e){
//In case that error throw 200 
            echo $e->errorMessage();
}
catch(\Kavenegar\Exceptions\HttpException $e){
//in case that there is any problem to connect to webservie  this error thow
            echo $e->errorMessage();
}
".  this is test_kavehnegar_api.py"import pytest
from unittest.mock import patch, MagicMock
from kavenegar import KavenegarAPI, APIException, HTTPException

@pytest.fixture
def api():
    return KavenegarAPI(apikey="1234567890abcdef")


# Helper to mock responses
def mock_response(status=200, entries=None):
    entries = entries or [{"id": 1}]
    response = MagicMock()
    response.raise_for_status.return_value = None
    response.json.return_value = {
        "return": {"status": status, "message": "OK" if status == 200 else "Error"},
        "entries": entries
    }
    return response


# ------------------------
# Generic test template for all API methods
# ------------------------
@patch("kavenegar.requests.Session.post")
@pytest.mark.parametrize("method_name,params", [
    ("sms_send", {"receptor": "09120000000", "message": "Test"}),
    ("sms_sendarray", {"messages": [{"receptor": "09120000000", "message": "Test"}]}),
    ("sms_status", {"messageid": 12345}),
    ("sms_statuslocalmessageid", {"localid": 1}),
    ("sms_select", {"messageid": 12345}),
    ("sms_selectoutbox", {"page": 1, "row": 10}),
    ("sms_latestoutbox", {"count": 5}),
    ("sms_countoutbox", None),
    ("sms_cancel", {"messageid": 12345}),
    ("sms_receive", None),
    ("sms_countinbox", None),
    ("sms_countpostalcode", {"postalcode": "12345"}),
    ("sms_sendbypostalcode", {"message": "Hello", "postalcode": "12345"}),
    ("verify_lookup", {"receptor": "09120000000", "token": "1234", "template": "verify"}),
    ("call_maketts", {"receptor": "09120000000", "message": "Hello"}),
    ("call_status", {"messageid": 1}),
    ("account_info", None),       # <-- no params
    ("account_config", {"timezone": "Asia/Tehran"})
])
def test_all_methods_success(mock_post, api, method_name, params):
    mocked = mock_response(status=200)
    mock_post.return_value.__enter__.return_value = mocked

    # Only pass params if not None
    if params is not None:
        result = getattr(api, method_name)(params)
    else:
        result = getattr(api, method_name)()

    assert result == [{"id": 1}]
    mock_post.assert_called_once()


# ------------------------
# Test APIException for all methods
# ------------------------
@patch("kavenegar.requests.Session.post")
@pytest.mark.parametrize("method_name", [
    "sms_send", "sms_sendarray", "sms_status", "sms_statuslocalmessageid",
    "sms_select", "sms_selectoutbox", "sms_latestoutbox", "sms_countoutbox",
    "sms_cancel", "sms_receive", "sms_countinbox", "sms_countpostalcode",
    "sms_sendbypostalcode", "verify_lookup", "call_maketts", "call_status",
    "account_info", "account_config"
])
def test_all_methods_api_exception(mock_post, api, method_name):
    fake_response = MagicMock()
    fake_response.raise_for_status.return_value = None
    fake_response.json.return_value = {
        "return": {"status": 401, "message": "Invalid API key"},
        "entries": []
    }
    mock_post.return_value = fake_response

    with pytest.raises(APIException):
        getattr(api, method_name)()


# ------------------------
# Test HTTPException for network errors
# ------------------------
@patch("kavenegar.requests.Session.post")
@pytest.mark.parametrize("method_name,params", [
    ("sms_send", {"receptor": "09120000000", "message": "Test"}),
    ("sms_sendarray", {"messages": [{"receptor": "09120000000", "message": "Test"}]}),
    ("sms_status", {"messageid": 12345}),
    ("sms_statuslocalmessageid", {"localid": 1}),
    ("sms_select", {"messageid": 12345}),
    ("sms_selectoutbox", {"page": 1, "row": 10}),
    ("sms_latestoutbox", {"count": 5}),
    ("sms_countoutbox", None),
    ("sms_cancel", {"messageid": 12345}),
    ("sms_receive", None),
    ("sms_countinbox", None),
    ("sms_countpostalcode", {"postalcode": "12345"}),
    ("sms_sendbypostalcode", {"message": "Hello", "postalcode": "12345"}),
    ("verify_lookup", {"receptor": "09120000000", "token": "1234", "template": "verify"}),
    ("call_maketts", {"receptor": "09120000000", "message": "Hello"}),
    ("call_status", {"messageid": 1}),
    ("account_info", None),       # <-- no params
    ("account_config", {"timezone": "Asia/Tehran"})
])
def test_all_methods_api_exception(mock_post, api, method_name, params):
    fake_response = MagicMock()
    fake_response.raise_for_status.return_value = None
    fake_response.json.return_value = {
        "return": {"status": 401, "message": "Invalid API key"},
        "entries": []
    }
    mock_post.return_value = fake_response

    # Only pass params if not None
    if params is not None:
        with pytest.raises(APIException):
            getattr(api, method_name)(params)
    else:
        with pytest.raises(APIException):
            getattr(api, method_name)()". this is "test_kavenegar_integration" as following "import os
import pytest
import json
from kavenegar import KavenegarAPI, HTTPException, APIException

# ------------------------
# Helper fixture
# ------------------------
@pytest.fixture
def api():
    api_key = os.getenv("KAVENEGAR_API_KEY")
    if not api_key:
        pytest.skip("KAVENEGAR_API_KEY not set, skipping integration tests")
    return KavenegarAPI(apikey=api_key)


# ------------------------
# 1️⃣ verify_lookup test
# ------------------------
@pytest.mark.integration
def test_verify_lookup(api):
    receptor = os.getenv("KAVENEGAR_TEST_PHONE")
    template = os.getenv("KAVENEGAR_TEMPLATE_NAME")
    if not receptor:
        pytest.skip("KAVENEGAR_TEST_PHONE not set, skipping verify_lookup test")

    params = {
        "receptor": receptor,
        "token": "1234",        # Test token
        "template": template    # Must match a template in your Kavenegar panel
    }

    try:
        result = api.verify_lookup(params)
        assert result is not None
        print("✅ verify_lookup result:", result)
    except (APIException, HTTPException) as e:
        pytest.fail(f"verify_lookup failed: {e}")


# ------------------------
# 2️⃣ sms_send test
# ------------------------
@pytest.mark.integration
def test_sms_send(api):
    receptor = os.getenv("KAVENEGAR_TEST_PHONE")
    sender = os.getenv("KAVENEGAR_SENDER_LINE_NUMBER")
    if not receptor:
        pytest.skip("KAVENEGAR_TEST_PHONE not set, skipping sms_send test")

    params = {
        "receptor": receptor,
        "sender": sender,
        "message": "تست ارسال پیام 🚀"
    }

    try:
        result = api.sms_send(params)
        assert result is not None
        print("✅ sms_send result:", result)
    except (APIException, HTTPException) as e:
        pytest.fail(f"sms_send failed: {e}")


# ------------------------
# 3️⃣ sms_sendarray test
# ------------------------
@pytest.mark.integration
def test_sms_sendarray(api):
    receptor = os.getenv("KAVENEGAR_TEST_PHONE")
    sender = os.getenv("KAVENEGAR_SENDER_LINE_NUMBER")
    if not receptor:
        pytest.skip("KAVENEGAR_TEST_PHONE not set, skipping sms_sendarray test")

    params = {
        "sender": json.dumps([sender, sender]),
        "receptor": json.dumps([receptor, receptor]),
        "message": json.dumps(["تست ارسال پیام 1 🚀", "تست ارسال پیام 2 🚀"])
    }

    try:
        result = api.sms_sendarray(params)
        assert result is not None
        print("✅ sms_sendarray result:", result)
    except (APIException, HTTPException) as e:
        pytest.fail(f"sms_sendarray failed: {e}")
". 