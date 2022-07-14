  var story = [];

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

  const $inp = $("#input-load");
  const $board = $("#main-board");

  $(document).ready(function(){newGame();});

  function OPSave(){
    for(let i = 4; i < 34; i++) {
      if (jdata_el[i]){
        story[i]["found"]=true;
      }
    }
    for(let i = 244; i < 284; i++) {
      if (jdata_el[i]){
        story[i]["found"]=true;
      }
    }
    for(let i = 1824; i < 1844; i++) {
      if (jdata_el[i]){
        story[i]["found"]=true;
      }
    }
    populate();
  }

  function newGame(){
    
    story = Object.fromEntries(  Object.entries(jdata_el).map(([ key, val ]) => [ Number(key), {"found":false,"count":1} ]) );
    //Number(key) also works. Below is a snippet that confirms that some ids are initially missing
    // console.log(Number(Object.keys(jdata_el)[3985]));
    // console.log(story[4004]);

    story[0]["found"]=true;
    story[1]["found"]=true;
    story[2]["found"]=true;
    story[3]["found"]=true;

    OPSave();

    for(let i = 0; i <4; i++) {
      o = document.createElement("div");
      o.classList.add("elem");
      o.style.backgroundImage="url('"+jdata_el[i][3]+"')";
      o.classList.add("p"+jdata_el[i][0]);
      o.dataset.element = i;
      o.dataset.picn = 0;
      o.innerHTML="<span>";
      o.innerHTML+='</span><span class="elem-name">'+jdata_el[i][1]+'</span>';
      $board.append(o);
    }
  }
  
  function populate(){
    Object.keys(story).forEach(el => {
      if (story[el]["found"]){
        o = document.createElement("div");
        o.classList.add("elem");
        o.style.backgroundImage="url('"+jdata_el[el][3]+"')";
        o.classList.add("p"+jdata_el[el][0]);
        o.dataset.element = el;
        o.dataset.picn = 0;
        o.innerHTML="<span>";
        o.innerHTML+='</span><span class="elem-name">'+jdata_el[el][1]+'</span>';
        $board.append(o);
      }
    });
  }

  function refresh(){
    $board.empty();
  }

  function changeName(){
    pla_name = $("#custom-name").val();
  }

  function dropElement(){
    let $sus = $(".elem-held-wrapper");
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
      let gg = event.target;
      gg.classList.toggle("restock");
      let $sus = $(".elem-held-wrapper .elem");

      if ($(".elem-held-wrapper").length && droppable){
        //place back
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
                  story[value[2]]["count"]++;
                  o =$tt[0];
                  o.innerHTML="<span>";
                  o.innerHTML+=story[value[2]]["count"];
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
                  if(story[value[2]]["count"]>1){
                    o.innerHTML+=story[value[2]]["count"];
                  }
                  o.innerHTML+='</span><span class="elem-name">'+jdata_el[value[2]][1]+'</span>';

                  o.style.visibility = "hidden";
                  //o.lastChild.style.visibility = "hidden";

                  $board.append(o);
                }

                o.scrollIntoView({behavior:"smooth", block: "center"});
                
                const n = o.cloneNode(true);
                n.style.visibility = "visible";
                n.classList.add("held");
                const g = document.createElement("div");
                var frame = $board;
                g.setAttribute("style", "left:" + event.pageX + "px;top:" + (event.pageY + 4) + "px");
                g.classList.toggle("elem-held-wrapper");
                g.classList.toggle("combine");
                g.appendChild(n);

                $board.append(g);

                

                const d = o.offsetLeft-gg.offsetLeft;
                const p = o.offsetTop-gg.offsetTop;
                h = (.95 * (d ** 2 + (4 * p) ** 2)) ** .4;
                f = Math.max(260, Math.min(250 + h, 1e3));
                //console.log(d+"  "+p);
                $(".combine").attr("style","--calculated-animation-time:" + f + "ms;"+"--offset-x:" + (-d) + "px;--offset-y:" +(-p) +
                "px;--offset-x-zero:" + (0 === d ? "1" : "0")+ ";left:" + (o.offsetLeft-8) + "px;top:" + (o.offsetTop-17) + "px");
                $(".combine").toggleClass("combine elem-found-wrapper");
                setTimeout( function() {$(".elem-found-wrapper").remove();o.style.visibility="visible";droppable=true; if (exi){o.classList.toggle("restock");}
                },f*2);
                
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
        var frame = $board;
        wrapper.setAttribute("style", "left:" + event.pageX + "px;top:" + (event.pageY + 4) + "px");
        wrapper.classList.add("elem-held-wrapper");
        wrapper.appendChild(n);
        $board.append(wrapper);
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

  function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
  function saveAndDownDatabases(){
    // let res_el = "var jdata_el = ";
    // res_el += JSON.stringify(jdata_el);
    // res_el += ";";
    
    // let res_eq = "var jdata_eq = ";
    // res_el += JSON.stringify(jdata_eq);
    // res_el += ";";

    download(JSON.stringify(jdata_el), 'elements.json2', 'text/plain');
    download(JSON.stringify(jdata_eq), 'equations.json2', 'text/plain');
  }

  function extendJDataEl(arg){     //use like extendJDataEl("");
    Object.values(jdata_el).forEach(element => {
      element.push(arg);
    });
  }

  function loadStory(){
    $inp.click();
    $inp.on('change', (event) => {onLoadStory();})
  }

  function onLoadStory(){
    const file = $inp.prop('files')[0];

    if (file.type && file.type.startsWith('application/json')) { //'text/javascript'
        console.log('File is not an SAV format.', file.type, file);
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e){
        //var data = event.target.result;
        
        story = JSON.parse(reader.result);
        refresh();
        populate();
    };
    
    reader.onerror = function(ex) {
        console.log(ex);
    };
    reader.readAsText(file);
  }

  function saveAndDownStory(){
    download(JSON.stringify(story), pla_name+'-elem-rebirth.sav', 'text/plain');
  }
