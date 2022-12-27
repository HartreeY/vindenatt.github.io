var version = "Dec2022-1";

var plaName = "guest";
var storyEls = [];
var triedEqs = [];
var cntCoin = 0;
var cntPelmen = 0;
var fuseCost = 20;

var curEl = null;
var droppable = true;
var pickable = true;
var wrapper = null;
var volumeAll = 0.8;

var sndCombine = new Audio('./sound/element-combine.mp3');
var sndDrop = new Audio('./sound/element-drop.mp3');
var sndInvalid = new Audio('./sound/element-invalid.mp3');
var sndPickup = new Audio('./sound/element-pickup.mp3');
var sndValid = new Audio('./sound/element-valid.mp3');
var sndNotif = new Audio('./sound/notification.mp3');
var sndClick = new Audio('./sound/popup-click.mp3');
var sndClose = new Audio('./sound/popup-close.mp3');
var sndOpen = new Audio('./sound/popup-open.mp3');
var sndStart = new Audio('./sound/startup.mp3');
var sndExplode = new Audio('./sound/element-explode.wav');

const $inp = $("#input-load");
const $board = $("#main-board");

$(document).ready(function () {
  $("#index-h1").append("<small>" + version + "</small>");
  newGame();
});

function OPSave() {
  for (let i = 4; i < 34; i++) {
    if (jdataEls[i]) {
      storyEls[i]["found"] = true;
      storyEls[i]["count"] = 1;
    }
  }
  for (let i = 244; i < 284; i++) {
    if (jdataEls[i]) {
      storyEls[i]["found"] = true;
      storyEls[i]["count"] = 1;
    }
  }
  for (let i = 1824; i < 1844; i++) {
    if (jdataEls[i]) {
      storyEls[i]["found"] = true;
      storyEls[i]["count"] = 1;
    }
  }

}

function newGame() {

  storyEls = Object.fromEntries(Object.entries(jdataEls).map(([key, val]) => [Number(key), { "found": false, "count": 0 }]));
  //Number(key) also works. Below is a snippet that confirms that some ids are initially missing
  // console.log(Number(Object.keys(jdataEls)[3985]));
  // console.log(storyEls[4004]);

  storyEls[0]["found"] = true;
  storyEls[1]["found"] = true;
  storyEls[2]["found"] = true;
  storyEls[3]["found"] = true;
  storyEls[0]["count"] = -1;
  storyEls[1]["count"] = -1;
  storyEls[2]["count"] = -1;
  storyEls[3]["count"] = -1;

  OPSave();

  populate();
}

function populate() {
  Object.keys(storyEls).forEach(el => {
    if (storyEls[el]["found"]) {
      o = document.createElement("div");
      o.classList.add("elem");
      o.style.backgroundImage = "url('" + jdataEls[el][3] + "')";
      o.classList.add("p" + jdataEls[el][0]);
      o.dataset.element = el;
      o.dataset.picn = 0;
      if (  storyEls[el]["count"] != -1)
        o.innerHTML = '<span class="elem-count">'+storyEls[el]["count"]+'</span>';
      else
        o.innerHTML = '<span class="elem-count"></span>';
      o.innerHTML += '<span class="elem-name">' + jdataEls[el][1] + '</span>';
      $board.append(o);
    }
  });
}

function refresh() {
  $board.empty();
}

function google(){
  window.open("https://www.google.com/search?q="+jdataEls[curEl.dataset.element][1],"_blank");
}

function changeName() {
  plaName = $("#custom-name").val();
}

function notYet(ele) {
  ele.classList.remove("restock");
  ele.classList.add("notyet");
  ele.addEventListener("animationend",function() {ele.classList.remove("notyet");});
  playSound(sndInvalid);
}

function dropElement() {
  let $heldElemWrap = $(".elem-held-wrapper");
  $heldElemWrap.addClass("elem-dropped-wrapper");
  $heldElemWrap.removeClass("elem-held-wrapper");
  window.removeEventListener("mousemove", wrapMouseFollow);
  /* console.log(" huh"); */
  if ($heldElemWrap.length) {
    //drop if holding
    playSound(sndDrop);
    $heldElemWrap.addClass("drop");
    $heldElemWrap.on("animationend", function () {
      $heldElemWrap.remove();
      $(".explosion").remove();
      /* console.log("animend"); */
    });
  }
}

function explodeElement() {
  let $heldElemWrap = $(".elem-held-wrapper");
  $heldElemWrap.addClass("elem-exploded-wrapper");
  $heldElemWrap.removeClass("elem-held-wrapper");
  window.removeEventListener("mousemove", wrapMouseFollow);
  if ($heldElemWrap.length) {
    playSound(sndExplode);
    $heldElemWrap.on("animationend", function () {
      $heldElemWrap.remove();
      $(".explosion").remove();
    });
  }
}

function playSound(snd){
  snd.pause();
  snd.currentTime = 0;
  snd.volume = volumeAll;
  snd.play();
}


$(document).click(function (event) {
  if ($(event.target).is('.elem')) {
    let targetElem = event.target;
    let $heldElem = $(".elem-held-wrapper .elem");
    
    let targetEl = targetElem.dataset.element;
    let heldEl = $heldElem.data("element");

    if ($(".elem-held-wrapper").length>0) {
      if (!droppable){
        notYet(targetElem);
      }
      else {
        let found = false;
        let BreakException = {};

        let elPair = [String(targetEl),String(heldEl)];
        let elPairInv = [String(heldEl),String(targetEl)];

        let aa = JSON.stringify(triedEqs);
        let bb1 = JSON.stringify(elPair);
        let bb2 = JSON.stringify(elPairInv);
        
        if((aa.indexOf(bb1) == -1) && (aa.indexOf(bb2) == -1)){
          console.log(bb1);
          triedEqs.push(elPair);
          triedEqs.push(elPairInv);
        }

        try {
          Object.values(jdataEqs).forEach(value => {
            if ( (jdataEls[value[2]]) && 
            (((value[0] == targetEl) && (value[1] == heldEl)) || ((value[1] == targetEl) && (value[0] == heldEl))) ) {
              found = true;
              playSound(sndCombine);
              droppable = false;

              const d = $(".elem-held-wrapper").offset().left - targetElem.offsetLeft;
              const p = $(".elem-held-wrapper").offset().top - targetElem.offsetTop;
              //console.log(event.clientX+"  "+targetElem.getBoundingClientRect().x);
              //console.log(event.clientY+"  "+targetElem.getBoundingClientRect().y);
              window.removeEventListener("mousemove", wrapMouseFollow);

              $(".elem-held-wrapper").toggleClass("combine elem-held-wrapper");
              $(".combine").attr("style", "--offset-x:" + (-d - 9) + "px;--offset-y:" + (-p - 16) +
                "px;left:" + $(".combine").offset().left +
                "px;top:" + $(".combine").offset().top + "px");

              setTimeout(function () {

                playSound(sndValid);
                $(".combine").remove();
                let $tt = $('.elem[data-element="' + value[2] + '"]');
                let o = null;
                let exi = false;

                if ($tt.length) {  //equiv. to found = true
                  
                  o = $tt[0];
                  if (  storyEls[value[2]]["count"] != -1){
                    storyEls[value[2]]["count"]++;
                    o.innerHTML = '<span class="elem-count">'+storyEls[value[2]]["count"]+'</span>';
                  }
                  else {
                    o.innerHTML = '<span class="elem-count"></span>';
                  }
                  o.innerHTML += '</span><span class="elem-name">' + jdataEls[value[2]][1] + '</span>';
                  o.classList.remove("restock");
                  setTimeout(function(){      o.classList.add("restock");    },2);
                  exi = true;
                } else {
                  storyEls[value[2]]["found"]=true;
                  storyEls[value[2]]["count"]++;
                  
                  o = document.createElement("div");
                  o.classList.add("elem");
                  o.style.backgroundImage = "url('" + jdataEls[value[2]][3] + "')";
                  o.classList.add("p" + jdataEls[value[2]][0]);
                  o.dataset.element = value[2];
                  if (  storyEls[value[2]]["count"] != -1)
                    o.innerHTML = '<span class="elem-count">'+storyEls[value[2]]["count"]+'</span>';
                  else
                    o.innerHTML = '<span class="elem-count"></span>';
                  o.innerHTML += '</span><span class="elem-name">' + jdataEls[value[2]][1] + '</span>';
                  o.style.visibility = "hidden";

                  $board.append(o);
                }

                o.scrollIntoView({ behavior: "smooth", block: "center" });

                let n = o.cloneNode(true);
                
                $(n).children(".elem-count").html('');
                n.classList.add("held");
                n.style.visibility="revert";

                let g = document.createElement("div");
                g.setAttribute("style", "left:" + event.pageX + "px;top:" + (event.pageY + 4) + "px");
                g.classList.toggle("combine");
                //console.log(g.classList);
                g.appendChild(n);
                $board.append(g);

                let d = o.offsetLeft - targetElem.offsetLeft;
                let p = o.offsetTop - targetElem.offsetTop;
                h = (.95 * (d ** 2 + (4 * p) ** 2)) ** .4;
                f = Math.max(260, Math.min(250 + h, 1e3));
                //console.log(d+"  "+p);
                $(".combine").attr("style", "--calculated-animation-time:" + f + "ms;" + "--offset-x:" + (-d) + "px;--offset-y:" + (-p) +
                  "px;--offset-x-zero:" + (0 === d ? "1" : "0") + ";left:" + (o.offsetLeft - 8) + "px;top:" + (o.offsetTop - 17) + "px");
                $(".combine").toggleClass("combine elem-found-wrapper");
                setTimeout(function () {
                  $(".elem-found-wrapper").remove(); o.style.visibility = "visible"; droppable = true; 
                  if (exi) {     o.classList.remove("restock");
                  setTimeout(function(){      o.classList.add("restock");    },2); }
                }, f * 2);

              }, 1000);
              throw BreakException;
            }
          });
        } catch (ff) {
          if (ff !== BreakException) throw ff;
        }
        if (!found) {
          $board.append("<img class='explosion' src='./images/Z92e.gif' style='left:"+($heldElem.offset().left-42)+"px;top:"+($heldElem.offset().top-77)+"px;position:absolute'></img>");
          explodeElement();

          let pelmenCounter = document.getElementById("pelmen-count");

          if((aa.indexOf(bb1) == -1) && (aa.indexOf(bb2) == -1)){
            pelmenCounterUpdate(1);

            let gPar = document.createElement("div");
            let g = document.createElement("img");
            gPar.appendChild(g);
            
            g.src='./images/pelmen.png';
            gPar.classList.toggle("flying-pelmen");
            let d = pelmenCounter.offsetLeft - $heldElem.offset().left-55;
            let p = pelmenCounter.offsetTop - $heldElem.offset().top-42;
            h = (.95 * (d ** 2 + (4 * p) ** 2)) ** .4;
            f = Math.max(260, Math.min(250 + h, 1e3));
/*             console.log(d+"  "+p);
            console.log(g.style.left+"  "+g.style.top);
            console.log(event.pageX+"  "+event.pageY); */
            $(gPar).attr("style", "--calculated-animation-time:" + f + "ms;" + "--offset-x:" + (-d) + "px;--offset-x-zero:" + (0 === d ? "1" : "0") + ";--offset-y:" + (-p) +
            "px;left:" + (pelmenCounter.offsetLeft-32) + "px;top:" + (pelmenCounter.offsetTop-2) + "px");
            $board.append(gPar);
          }
        }
      }
    }
    else if ($(targetElem).hasClass("elem-selected")){
      if (pickable) {
        targetElem.classList.remove("restock");
        setTimeout(function(){      targetElem.classList.add("restock");    },2);
        playSound(sndPickup);

        const n = targetElem.cloneNode(true);
        $(n).children(".elem-count").html('');
        n.classList.add("held");
        // pickable = false;
        // setTimeout(function () { pickable = true; }, 600);
        //n.addEventListener("animationend",function() {pickable=true;});
        const d = targetElem.offsetLeft - event.pageX;
        const p = targetElem.offsetTop - event.pageY;
        n.style.cssText += "--offset-x:" + d + "px;--offset-y:" + p + "px";
        wrapper = document.createElement("div");
        wrapper.setAttribute("style", "left:" + event.pageX + "px;top:" + (event.pageY + 4) + "px");
        wrapper.classList.add("elem-held-wrapper");
        wrapper.appendChild(n);
        $board.append(wrapper);
        window.addEventListener('mousemove', wrapMouseFollow);
      }
      else {
        notYet(targetElem);
      }
    }
    else {
      $(".elem-selected").removeClass("elem-selected");
      curEl = targetElem;
      curEl.classList.add("elem-selected");
      $(".edit-field").show();
      
      $("#prop-name").empty();
      $("#prop-name").append("<span id='prop-id'>"+curEl.dataset.element+"</span>"+jdataEls[curEl.dataset.element][1]);
      $("#prop-desc").empty();
      $("#prop-desc").append(jdataEls[curEl.dataset.element][2]);
      if (jdataEls[curEl.dataset.element][11])
        $("#prop-desc").append(jdataEls[curEl.dataset.element][11]);
    }
  }
  else if ($(".elem-held-wrapper").length>0) {
    dropElement();
  }
  else {
    playSound(sndClick);
  }

});
function wrapMouseFollow(event) {
  wrapper.style.left = event.pageX + "px";
  wrapper.style.top = event.pageY + "px";
}

function pelmenCounterUpdate(count=1){
  cntPelmen+=count;
  $("#pelmen-count").html(cntPelmen);
  ;
  if(cntPelmen>=fuseCost){
    $("#pelmen-fuse").prop( "disabled", false );
  }
  else{
    $("#pelmen-fuse").prop( "disabled", true );
  }
}

$('#element-scale').change(function () {
  const maxFontSize = 1.4;
  document.documentElement.style.setProperty('--element-scale', $('#element-scale').val());
  if (document.documentElement.style.getPropertyValue('--element-scale')<=maxFontSize){
    document.documentElement.style.setProperty('--font-size', $('#element-scale').val()*11+"px");
}
  else{
    document.documentElement.style.setProperty('--font-size', maxFontSize*11+"px");
  }
});

$('#volume-range').change(function () {
  volumeAll = $('#volume-range').val();
});

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
function saveAndDownDatabases() {

  download(JSON.stringify(jdataEls), 'elements.json2', 'text/plain');
  download(JSON.stringify(jdataEqs), 'equations.json2', 'text/plain');
}

function extendJdataEl(arg) {     //use like extendJDataEl("");
  Object.values(jdataEls).forEach(element => {
    element.push(arg);
  });
}

function loadStory() {

  $inp.on('click', (event) => { onLoadStory(); })
  $inp.click();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function fusePelmen(_this){
  let elToProduce = -1;
  
  if(cntPelmen>=fuseCost) {
    for (let i=0;i<Object.keys(storyEls).length;i++){
      let rand = getRandomInt(Object.keys(storyEls).length);

      if(!storyEls[rand]["found"]){
        elToProduce = rand;
        pelmenCounterUpdate(-20);

        playSound(sndCombine);

        setTimeout(function () {

          playSound(sndValid);

          storyEls[elToProduce]["found"] = true;
          storyEls[elToProduce]["count"]++;

          o = document.createElement("div");
          o.classList.add("elem");
          o.style.backgroundImage = "url('" + jdataEls[elToProduce][3] + "')";
          o.classList.add("p" + jdataEls[elToProduce][0]);
          o.dataset.element = elToProduce;
          if (storyEls[elToProduce]["count"] != -1)
            o.innerHTML = '<span class="elem-count">' + storyEls[elToProduce]["count"] + '</span>';
          else
            o.innerHTML = '<span class="elem-count"></span>';
          o.innerHTML += '</span><span class="elem-name">' + jdataEls[elToProduce][1] + '</span>';
          o.style.visibility = "hidden";
          $board.append(o);


          o.scrollIntoView({ behavior: "smooth", block: "center" });

          let n = o.cloneNode(true);

          $(n).children(".elem-count").html('');
          n.classList.add("held");
          n.style.visibility = "revert";

          let g = document.createElement("div");
          g.setAttribute("style", "left:" + _this.getBoundingClientRect().left + "px;top:" + (_this.getBoundingClientRect().top + 4) + "px");
          g.classList.toggle("combine");
          //console.log(g.classList);
          g.appendChild(n);
          $board.append(g);

          let d = o.offsetLeft - _this.getBoundingClientRect().left;
          let p = o.offsetTop - _this.getBoundingClientRect().top;
          h = (.95 * (d ** 2 + (4 * p) ** 2)) ** .4;
          f = Math.max(260, Math.min(250 + h, 1e3));
          //console.log(d+"  "+p);
          $(".combine").attr("style", "--calculated-animation-time:" + f + "ms;" + "--offset-x:" + (-d) + "px;--offset-y:" + (-p) +
            "px;--offset-x-zero:" + (0 === d ? "1" : "0") + ";left:" + (o.offsetLeft - 8) + "px;top:" + (o.offsetTop - 17) + "px");
          $(".combine").toggleClass("combine elem-found-wrapper");
          setTimeout(function () {
            o.style.visibility = "visible";
          }, f * 2);

        }, 1000);

        break;
      }
    }
    if (elToProduce == -1){
      $("#index-h1").text = "Well damn, you've discovered all the elements!";
    }
  }
}

function onLoadStory() {

  const file = $inp.prop('files')[0];
  const reader = new FileReader();
  console.log(444);

  reader.addEventListener("load", () => {
    //var data = event.target.result;
    let spl = reader.result.split("#");
    cntCoin = Number(spl[0]);
    cntPelmen = Number(spl[1]);
    pelmenCounterUpdate(0);
    storyEls = JSON.parse(spl[2]);
    refresh();
    populate();
  }, false);

  if (file && file.type && file.type.startsWith('application/json')) { //'text/javascript'
    console.log('File is not an SAV format.', file.type, file);
    return;
  }
  else if (file) {
    reader.readAsText(file);
  }
}

function saveAndDownStory() {
  let storyVarsStr = cntCoin+"#"+cntPelmen+"#";
  download(storyVarsStr+JSON.stringify(storyEls), plaName + '-elem-rebirth.sav', 'text/plain');
}
