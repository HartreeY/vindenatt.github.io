<?php
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "elemental";
        $conn = new mysqli($servername, $username, $password, $dbname) or die("aaaa");
        if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
        }
        $sql = "SELECT id,parent1,parent2,child FROM equations";
        $result = mysqli_query($conn, $sql);

        $data_eq = array();

        while($enr = mysqli_fetch_assoc($result)){
            $data_eq[$enr['id']] = array($enr['parent1'], $enr['parent2'], $enr['child']);

        }

        $sql = "SELECT id,color,name,content,image FROM elements";
        $result = mysqli_query($conn, $sql);

        $data_el = array();

        while($enr = mysqli_fetch_assoc($result)){
            $data_el[$enr['id']] = array($enr['color'], $enr['name'], $enr['content'],$enr['image']);

        }
        
?><!DOCTYPE HTML>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- displays site properly based on user's device -->

  <link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png">
  <link rel="stylesheet" href="css/style.css">
<!--   <script src="game.js"></script>
  <script src="p5.min.js"></script> -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  
  <title>Elemental: Rebirth</title>
</head>
<body>

  <!--<header>
    <div class="header-item">Login</div>
    <div class="header-item">Register</div>
  </header>-->

  <nav>
    <div class="nav-item">Hub</div>
    <div class="nav-item"><button onclick="javascript:saveAndDownload()">Download</button></div>
    <div class="nav-item">About</div>
  </nav>

  <div class="main-grid">
    <main>
      <div id="main-board">
      <?php
          for($i = 0; $i <200; $i++) { ?>

            <div class="elem p<?=$data_el[$i][0]?>" data-element="<?=$i?>" style="background-image:url('<?=$data_el[$i][3]?>')"><span><?=$data_el[$i][2]?></span>
            <span class="elem-name">
              <?=$data_el[$i][1]?></span></div>
      <?php }?>
      </div>
    </main>
    <aside>
      <div class="aside-feature">
      <label class="feature-label"><input type="range" id="element-scale" name="element-scale" min="0.5" max="2" value="1" step="0.5">
      Element scale</label>
      </div>
    </aside>
  </div>
  
  <!-- <footer>
    Coded by <a href="http://roentg.wix.com/prinnylist">Hartree</a>.
  </footer> -->
</body>
<script type="text/javascript">

  var jdata_el = <?=json_encode($data_el)?>;
  var jdata_eq = <?=json_encode($data_eq)?>;
  var new_params = Object.fromEntries(  Object.entries(jdata_eq).map(([ key, val ]) => [ key, 1 ]) );

  var droppable = true;
  var pickable = true;
  var wrapper = null;

  var snd_combine = new Audio('./sound/element-combine.mp3');
  var snd_drop = new Audio('./sound/element-drop.mp3');
  var snd_invalid = new Audio('./sound/element-invalid.mp3');
  var snd_pickup = new Audio('./sound/element-pickup.mp3');
  var snd_valid = new Audio('./sound/element-valid.mp3');
  var snd_notif = new Audio('./sound/notification.mp3');
  var snd_click = new Audio('./sound/popup-click.mp3');
  var snd_close = new Audio('./sound/popup-close.mp3');
  var snd_open = new Audio('./sound/popup-open.mp3');
  var snd_start = new Audio('./sound/startup.mp3');


  function dropElement(){
    var $sus = $(".elem-held-wrapper");
    if ($sus.length){
      //drop if holding
        snd_drop.pause();
        snd_drop.currentTime = 0;
        snd_drop.play();
        $sus.addClass("drop");
        $sus.on("animationend", function() {
            $sus.remove();
            console.log("animend"); 
        });
    }
  }

  $(document).click(function(event) { 
    if(!$(event.target).is('.elem') || $(event.target).is('.held'))
    {
            dropElement();
    }
    else {
      var gg = event.target;
      gg.classList.toggle("restock");
      var $sus = $(".elem-held-wrapper .elem");

      if ($(".elem-held-wrapper").length && droppable){
        //place back
        console.log(event.target.classList);
        var found = false;
        var BreakException = {};

        try {
          Object.values(jdata_eq).forEach(value => {
            if ( (value[0]==(gg.dataset.element) && value[1]==($sus.data("element"))) ||
                  (value[1]==(gg.dataset.element) && value[0]==($sus.data("element")))  ){
              found = true;
              snd_combine.pause();
              snd_combine.currentTime = 0;
              snd_combine.play();
              droppable=false;  


              const d = $(".elem-held-wrapper").offset().left-gg.offsetLeft;
              const p = $(".elem-held-wrapper").offset().top-gg.offsetTop;
              //console.log(event.clientX+"  "+gg.getBoundingClientRect().x);
              //console.log(event.clientY+"  "+gg.getBoundingClientRect().y);
              console.log(d);
              console.log(p);
              window.removeEventListener("mousemove",mouseMove);

              

              $(".elem-held-wrapper").toggleClass("combine elem-held-wrapper");
              $(".combine").attr("style","--offset-x:" + (-d-9) + "px;--offset-y:" + (-p-16) +
                "px;left:" + $(".combine").offset().left + 
                "px;top:" + $(".combine").offset().top + "px");

              setTimeout( function() {
                
                snd_valid.pause();
                snd_valid.currentTime = 0;
                snd_valid.play();
                $(".combine").remove();
                var $tt=$('.elem[data-element="'+value[2]+'"]');
                var o = null;
                var exi = false;

                if ($tt.length){
                  new_params[value[2]]++;
                  o =$tt[0];
                  o.innerHTML="<span>";
                  o.innerHTML+=new_params[value[2]];
                  o.innerHTML+='</span><span class="elem-name">'+jdata_el[value[2]][1]+'</span>';
                  o.classList.toggle("restock");
                  exi=true;
                }else {
                  
                  o = document.createElement("div");
                  o.classList.add("elem");
                  
                  o.style.backgroundImage="url('"+jdata_el[value[2]][3]+"')";
                  o.classList.add("p"+jdata_el[value[2]][0]);
                  o.dataset.element = value[2];
                  o.innerHTML="<span>";
                  //if(jdata_el[value[2]][2]){
                  if(new_params[value[2]]>1){
                    o.innerHTML+=new_params[value[2]];
                  }
                  o.innerHTML+='</span><span class="elem-name">'+jdata_el[value[2]][1]+'</span>';

                  o.style.visibility = "hidden";
                  //o.lastChild.style.visibility = "hidden";

                  $("#main-board").append(o);
                }

                o.scrollIntoView({behavior:"smooth", block: "center"});
                
                const n = o.cloneNode(true);
                n.style.visibility = "visible";
                n.classList.add("held");
                const g = document.createElement("div");
                var frame = $("#main-board");
                g.setAttribute("style", "left:" + event.pageX + "px;top:" + (event.pageY + 4) + "px");
                g.classList.toggle("elem-held-wrapper");
                g.classList.toggle("combine");
                g.appendChild(n);

                $("#main-board").append(g);

                

                const d = o.offsetLeft-gg.offsetLeft;
                const p = o.offsetTop-gg.offsetTop;
                h = (.95 * (d ** 2 + (4 * p) ** 2)) ** .4;
                f = Math.max(260, Math.min(250 + h, 1e3));
                //console.log(d+"  "+p);
                $(".combine").attr("style","--calculated-animation-time:" + f + "ms;"+"--offset-x:" + (-d) + "px;--offset-y:" +(-p) +
                "px;--offset-x-zero:" + (0 === d ? "1" : "0")+ ";left:" + (o.offsetLeft-8) + "px;top:" + (o.offsetTop-17) + "px");
                $(".combine").toggleClass("combine elem-found-wrapper");
                setTimeout( function() {$(".elem-found-wrapper").remove();o.style.visibility="visible";droppable=true; if (exi){o.classList.toggle("restock");}
                },1000);
                
              },1000);
              throw BreakException;
            }
            });
            } catch (ff) {
              if (ff !== BreakException) throw ff;
            }
        if (!found) {
          dropElement();

        }
      }
      else if (pickable){
        snd_pickup.pause();
        snd_pickup.currentTime = 0;
        snd_pickup.play();

        const n = gg.cloneNode(true);
        n.firstChild.innerHTML='';
        n.classList.add("held");
        pickable=false;
                setTimeout(function() {pickable=true;},1500);
        //n.addEventListener("animationend",function() {pickable=true;});
        const d = gg.offsetLeft-event.pageX;
        const p = gg.offsetTop-event.pageY;
        n.style.cssText+="--offset-x:" + d + "px;--offset-y:" + p + "px";
        wrapper = document.createElement("div");
        var frame = $("#main-board");
        wrapper.setAttribute("style", "left:" + event.pageX + "px;top:" + (event.pageY + 4) + "px");
        wrapper.classList.add("elem-held-wrapper");
        wrapper.appendChild(n);
        $("#main-board").append(wrapper);
        window.addEventListener('mousemove', mouseMove);
      }
      }

  });
  function mouseMove(event){
    wrapper.style.left = event.pageX+ "px";
    wrapper.style.top = event.pageY+ "px";
  }

  $('#element-scale').change( function () {
    document.documentElement.style.setProperty('--element-scale', $('#element-scale').val());
  });
  function elementRescale(){

  }

</script>
</html>