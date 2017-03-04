$(function() {
    var base_paper = Snap("#base_svg");
    var current_polyline;

    var polyline_array = [];
    var current_point_array = [];
    var current_tool = "";
    var current_color="#000000"
    var down_flg=false;

    var COLORS=["#000000","#e6e6e6","#ed1c24","#f7931e","#fcee21","#8cc63f","#009245","#29abe2","#2e3192"]

    base_paper.mousedown(_down);
    base_paper.mousemove(_move);
    base_paper.mouseup(_up);
    base_paper.mouseout(_out);


    for(var i=0;i<COLORS.length;i++){
        $("#color").append("<li style='background-color:" + COLORS[i] + "''></li>")
    }


    $("#save_btn").on("click", function() {
        convertToDST(polyline_array)
    })

    $("#stitch_point_btn").on("click", function() {
        current_tool = "stitch_tool";
        createNewLine()
    })


    $("#stitch_line_btn").on("click", function() {
        current_tool = "stitch_line_tool";
        createNewLine()
    })


    $("#color li").on("click",function(){
        var color=$(this).css("backgroundColor");
        current_color=color;
    })

    function createNewLine(){
        current_point_array = [];
        polyline_array.push(current_point_array)
        
        //新規polyline
        current_polyline = base_paper.polyline().attr({ fill: "none",strokeWidth:3, stroke: current_color });
    }




    function _down(e) {
        down_flg=true;

        var pt ={x:e.offsetX,y:e.offsetY} //base_paper.getSVGPoint(e);

        if (current_tool == "stitch_tool" || current_tool == "stitch_line_tool") {      
            current_point_array.push(pt.x, pt.y);
            current_polyline.attr({ points: current_point_array, stroke: current_color });
        }

        
    }


    function _move(e) {
        if (!current_point_array.length){return false;}

        var pt ={x:e.offsetX,y:e.offsetY} //base_paper.getSVGPoint(e);
        if (current_tool == "stitch_tool") {
            current_polyline.attr({ points: current_point_array.concat([pt.x, pt.y]) , stroke: current_color});
        }else if(current_tool == "stitch_line_tool" && down_flg===true){
            current_point_array.push(pt.x, pt.y);
            current_polyline.attr({ points: current_point_array, stroke: current_color });
        }

        
    }


    function _up(e) {
        down_flg=false;

        if(current_point_array.length && current_tool == "stitch_line_tool"){
            current_point_array = [];
            polyline_array.push(current_point_array)
            current_polyline = base_paper.polyline().attr({ fill: "none",strokeWidth:3, stroke: current_color });
        }
    }

    function _out(e) {
        if (!current_point_array.length){return false;}

        if (current_tool == "stitch_tool") {
            current_polyline.attr({ points: current_point_array });
        }

    }







});
