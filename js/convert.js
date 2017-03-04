var prevX;
var prevY;
var p; //ポイント
var p_length = 0;
var embCode = []; //刺繍部分

var half_w;
var half_h;

var sel_width;
var sel_height;

var current_p;
var currentX;
var currentY;

var stich_point = 0;
var color_change = 0;

var l, t, r, b, min_l, min_t, max_r, max_b;



function convertToDST(array) {
    embCode = [];
    stich_point = 0;
    var target_array;

    prevX=prevY=0;

    for (var i = 0; i < array.length; i++) {
        target_array = array[i]
        

        for (var j = 0; j < target_array.length; j += 2) {
            currentX = (target_array[j]);
            currentY = (target_array[j + 1]);

            //console.log(prevX - currentX, -( prevY - currentY))
            writeBinary((prevX - currentX),-( prevY - currentY));//yは座標が逆

            prevX = currentX;
            prevY = currentY;

            stich_point++;

        }

        if(target_array.length){
            embCode.push(0x0,0x0,0xC3);
            color_change++;
        }
        
    }

    saveFile()
}



/*======================================================

encode

======================================================*/

function writeBinary(moveX, moveY) {
    var b1 = 0x0;
    var b2 = 0x0;
    var b3 = 0x0;
    var mx = moveX;
    var my = moveY;
    var over_mx = 0;
    var over_my = 0;

    if (Math.abs(mx) > 121 || Math.abs(my) > 121) {
        if (mx < -121) {
            over_mx = mx + 121;
            mx = -121;
        } else if (mx > 121) {
            over_mx = mx - 121;
            mx = 121;
        };

        if (my < -121) {
            over_my = my + 121;
            my = -121;
        } else if (my > 121) {
            over_my = my - 121;
            my = 121;
        };

        b3 |= 0x80;
    }

    //81-(27+9+3+1)=41
    if (mx >= 41) {
        b3 |= 0x8; //00000100
        mx -= 81;
    }

    if (mx <= -41) {
        b3 |= 0x4; //00001000
        mx += 81;
    }

    if (my >= 41) {
        b3 |= 0x10; //00100000
        my -= 81;
    }

    if (my <= -41) {
        b3 |= 0x20; //00010000
        my += 81;
    }

    //27-(9+3+1)=14
    if (mx >= 14) {
        b2 |= 0x8; //00000100
        mx -= 27;
    }

    if (mx <= -14) {
        b2 |= 0x4; //00001000
        mx += 27;
    }

    if (my >= 14) {
        b2 |= 0x10; //00100000
        my -= 27;
    }

    if (my <= -14) {
        b2 |= 0x20; //00010000
        my += 27;
    }

    //9-(3+1)=5
    if (mx >= 5) {
        b1 |= 0x8; //00000100
        mx -= 9;
    }

    if (mx <= -5) {
        b1 |= 0x4; //00001000
        mx += 9;
    }

    if (my >= 5) {
        b1 |= 0x10; //00100000
        my -= 9;
    }

    if (my <= -5) {
        b1 |= 0x20; //00010000
        my += 9;
    }

    //3-(1)=2
    if (mx >= 2) {
        b2 |= 0x2; //00000001
        mx -= 3;
    }

    if (mx <= -2) {
        b2 |= 0x1; //00000010
        mx += 3;
    }

    if (my >= 2) {
        b2 |= 0x40; //10000000
        my -= 3;
    }

    if (my <= -2) {
        b2 |= 0x80; //01000000
        my += 3;
    }

    //1
    if (mx >= 1) {
        b1 |= 0x2; //00000001
        mx -= 1;
    }

    if (mx <= -1) {
        b1 |= 0x1; //00000010
        mx += 1;
    }

    if (my >= 1) {
        b1 |= 0x40; //10000000
        my -= 1;
    }

    if (my <= -1) {
        b1 |= 0x80; //01000000
        my += 1;
    }

    b3 |= 0x3; //00000011

    // 3バイトのバイナリ
    embCode.push(b1, b2, b3);

    if (over_mx || over_my) {
        writeBinary(over_mx, over_my);
    }
}


/*======================================================

write

======================================================*/


function saveFile() {
    var name = "sample.dst";

    sel_width = 1000; // Math.round((max_r - min_l)/RATIO)//width
    sel_height = 1000; // Math.round((max_b - min_t)/RATIO);//height

    half_w = Math.round(sel_width / 2); //原点設定用?とりあえず中心
    half_h = Math.round(sel_height / 2);

    //header  
    var str = "";
    str += "LA:  " + name;
    str += "\rST:  " + stich_point; //総針数
    str += "\rCO:  " + color_change;
    str += "\r+X:  " + half_w;
    str += "\r-X:  " + half_w;
    str += "\r+Y:  " + half_h;
    str += "\r-Y:  " + half_h;
    str += "\rAX:+    " + 0;
    str += "\rAY:+    " + 0;
    str += "\rMX:+    " + 0;
    str += "\rMY:+    " + 0;
    str += "\rPD:" + "******"
    str += "\r";

    //string blank
    var blank_num = 512 - str.length;
    for (var k = 0; k < blank_num; k++) {
        str += " ";
    }

    //START_CODE
    embCode.unshift(0x00, 0x00, 0x83)

    //END_CODE
    embCode.push(0x00, 0x00, 0xF)


    var u8_embCode = new Uint8Array(embCode)
    var blob = new Blob([str, u8_embCode], { type: "application/octet-binary" });

    //コピペ(http://kuroeveryday.blogspot.jp/2016/05/file-download-from-browser.html)
    var a = document.createElement('a');
    a.download = name;
    a.target = '_blank';

    if (window.navigator.msSaveBlob) {
        // for IE
        window.navigator.msSaveBlob(blob, name)
    } else if (window.URL && window.URL.createObjectURL) {
        // for Firefox
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else if (window.webkitURL && window.webkitURL.createObject) {
        // for Chrome
        a.href = window.webkitURL.createObjectURL(blob);
        a.click();
    } else {
        // for Safari
        window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
    }

}


