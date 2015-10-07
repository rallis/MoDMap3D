window.onload=startLoading;
// window.onunload=function (){};

var dbg=false;
var mapid,dim1,dim2,dim3,radius; //vars from url
var alldata; // contains everything from map[i].txt file
var setOfPoints, colors, numberOfLabels, namesOfLabels, legendColors, legendLabels; // 6 first lines in input file
var globalScaledPointsCoord;
var globalPointsLabels;
var intersectedPoint;
var geometries, materials, meshes; // for 3D drawing
var selectedIndex, minDistance;
var infoDiv = document.createElement('div');
var pointInfoDiv = document.createElement('div');
var dbgDiv = document.createElement('div');

function geturlparamvalue(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    //alert("res=["+results+"]");
    if(results!=null){
        return results[1];
    }else{
        return -1;
    }
}

function startLoading(){
    if(geturlparamvalue('dbg')=="true"){dbg=true;}    
    mapid=geturlparamvalue('mapid');
    dim1=geturlparamvalue('dim1');
    dim2=geturlparamvalue('dim2');
    dim3=geturlparamvalue('dim3');
    radius=geturlparamvalue('radius');
    if((radius<=0)||(radius>0.1)){radius=0.07;}
    if(dbg){alert("radius="+radius);}
    if(dbg){alert("mapid="+mapid);}
    if(mapid>0){
      loadXMLDoc(mapid);
    }else{
        document.write('</br><center><font color="red" size="5">Please specify a map to load from <a href="index.html">here</a></font></center>');
    }
}

function loadXMLDoc(loadById){  
  var xmlhttp;
  if (window.XMLHttpRequest){ // IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp=new XMLHttpRequest();
  }else{ // code for IE6, IE5
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      document.getElementById("temp").innerHTML=xmlhttp.responseText;
      alldata=document.getElementById("temp").innerHTML;
      document.getElementById("temp").innerHTML="";
      if(dbg){alert("to call initialize..");}
      initialize(); // calls gmap initialization
      if(dbg){alert("to call computeDist..");}
      //computeDist(true); // load dist file
    }
  }
  xmlhttp.open("GET","maps/map"+loadById+".txt",true);
  xmlhttp.send();
}

function initGraphics(){
	if(dbg){alert("welcomeGraphics!");}

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    var mouse = new THREE.Vector2();
    //var projector = new THREE.Projector(); // OLD NOT NEEDED ANYMORE
    var raycaster = new THREE.Raycaster();
    var renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor( 0xC7C7C7, 1); //change color  E9E9E9   A1A1A1  C7C7C7


    var selected1 = null;
    var selected2 = null;

    var cubeSize = 0.075;
    var selectedSize = 0.1; // must be > cubeSize
    var axisUnit = 0.15; // must be > selectedSize

    // OLD CUBE
    // var protoCubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    // var protoSelectedCubeGeometry = new THREE.CubeGeometry(selectedSize, selectedSize, selectedSize);
    // var protoVertexCount = protoCubeGeometry.vertices.length;

    var protoSphereGeometry = new THREE.SphereGeometry(radius);
    var protoSelectedSphereGeometry = new THREE.SphereGeometry(0.1);
    var protoVertexCount = protoSphereGeometry.vertices.length;

    function cloneGeometry(from, to, vertexOffsets, vertexCountOffset) {
        for (var i in from.vertices) {
            var v = from.vertices[i];
            to.vertices.push(new THREE.Vector3(v.x + vertexOffsets.x, v.y + vertexOffsets.y, v.z + vertexOffsets.z));  
        }
        for (var i in from.faces) {
            var f = from.faces[i];
            to.faces.push(new THREE.Face3(f.a + vertexCountOffset, f.b + vertexCountOffset, f.c + vertexCountOffset));
        }
    }

    geometries = new Array();
    materials= new Array();
    meshes = new Array(); //= new THREE.Mesh();
    offsets = [];
    var s=0;
    var startInd;
    for(var i=0; i<setOfPoints.length; i++){
        var tmpGeometry = new THREE.Geometry();
        geometries.push(tmpGeometry);
        startInd=s;
        for(var j=0; j<setOfPoints[i]; j++){
            offsets.push({
                x:/*Math.floor(*/20*globalScaledPointsCoord[s][0]/*)*/*axisUnit, 
                y:/*Math.floor(*/20*globalScaledPointsCoord[s][1]/*)*/*axisUnit, 
                z:/*axisUnit*/20*globalScaledPointsCoord[s][2]*axisUnit}); 
            s++;
        }

        var noidea=0;
        for (var r = startInd; r<s; r++) {
            cloneGeometry(protoSphereGeometry, geometries[i], offsets[r], protoVertexCount * noidea);
            noidea++;
        }
        geometries[i].mergeVertices();
        geometries[i].computeFaceNormals();
        geometries[i].computeVertexNormals();

        var tmpMaterial = new THREE.MeshLambertMaterial({color: colors[i], wireframe:false, shading: THREE.SmoothShading});
        materials.push(tmpMaterial);
        var tmpMesh = new THREE.Mesh(geometries[i], materials[i]);
        meshes.push(tmpMesh);
        scene.add(meshes[i]);
    }

    // ROZ KIVOS GIA global box
    // var geometry2 = new THREE.BoxGeometry( 7,7,7 );
    // var material2 = new THREE.MeshBasicMaterial( {color: 0xff00ff ,transparent:true, opacity:0.1} );
    // var cube2 = new THREE.Mesh( geometry2, material2 );
    // meshes.push(cube2);
    // scene.add( cube2 );


    var facedownGeom = new THREE.Geometry();
    var faceupGeom = new THREE.Geometry();
    var line1Geom = new THREE.Geometry();
    var line2Geom = new THREE.Geometry();
    var line3Geom = new THREE.Geometry();
    var line4Geom = new THREE.Geometry();
    var cubeMaterial = new THREE.LineBasicMaterial({color: 0x000000});
    
    facedownGeom.vertices.push(new THREE.Vector3( -3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, -3.5, -3.5 ));
    faceupGeom.vertices.push(new THREE.Vector3( -3.5, -3.5, 3.5 ),new THREE.Vector3( 3.5, -3.5, 3.5 ), new THREE.Vector3( 3.5, 3.5, 3.5 ),new THREE.Vector3( -3.5, 3.5, 3.5 ),new THREE.Vector3( -3.5, -3.5, 3.5 ));
    line1Geom.vertices.push(new THREE.Vector3( -3.5, -3.5, -3.5 ),new THREE.Vector3( -3.5, -3.5, 3.5 ));
    line2Geom.vertices.push(new THREE.Vector3( -3.5, 3.5, -3.5 ),new THREE.Vector3( -3.5, 3.5, 3.5 ));
    line3Geom.vertices.push(new THREE.Vector3( 3.5, -3.5, -3.5 ),new THREE.Vector3( 3.5, -3.5, 3.5 ));
    line4Geom.vertices.push(new THREE.Vector3( 3.5, 3.5, -3.5 ),new THREE.Vector3( 3.5, 3.5, 3.5 ));

    var facedown = new THREE.Line( facedownGeom, cubeMaterial );
    var faceup = new THREE.Line( faceupGeom, cubeMaterial );
    var line1 = new THREE.Line( line1Geom, cubeMaterial );
    var line2= new THREE.Line( line2Geom, cubeMaterial );
    var line3 = new THREE.Line( line3Geom, cubeMaterial );
    var line4 = new THREE.Line( line4Geom, cubeMaterial );

    meshes.push(facedown); meshes.push(faceup); 
    meshes.push(line1); meshes.push(line2); meshes.push(line3); meshes.push(line4);
    scene.add(facedown); scene.add(faceup);
    scene.add(line1); scene.add(line2); scene.add(line3); scene.add(line4);


    var selectedGeometry = new THREE.Geometry();
    var selectedMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, wireframe:false, shading: THREE.SmoothShading});
    var selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
    scene.add(selectedMesh);


    camera.position.z = 17;    
    var ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 1, 1, 1 );
    scene.add( directionalLight );

    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    };
    
    render();            
   
    //infoDiv.style.width = 180+'px';
    //infoDiv.style.height = 250+'px';
    infoDiv.style.position = 'absolute';
    infoDiv.style.padding = "5px 5px 5px 5px";
    infoDiv.style.backgroundColor = "black";
    infoDiv.style.border = "1px dashed";
    infoDiv.style.color = "white";
    infoDiv.style.top = 10 + 'px';
    infoDiv.style.left = 10 + 'px';
    document.body.appendChild(infoDiv);

    //pointInfoDiv.style.width = 200+'px';
    //pointInfoDiv.style.height = 60+'px';
    pointInfoDiv.style.position = 'absolute';
    pointInfoDiv.style.maxWidth=250+'px';
    pointInfoDiv.style.padding = "5px 5px 5px 5px";
    pointInfoDiv.style.backgroundColor = "black";
    pointInfoDiv.style.border = "1px dashed";
    pointInfoDiv.style.color = "white";
    pointInfoDiv.style.bottom = 10 + 'px';
    pointInfoDiv.style.left = 10 + 'px';
    document.body.appendChild(pointInfoDiv);

    dbgDiv.style.position = 'absolute';
    dbgDiv.style.width = 250+'px';
    dbgDiv.style.height = 60+'px';
    dbgDiv.style.padding = "5px 5px 5px 5px";
    dbgDiv.style.backgroundColor = "black";
    dbgDiv.style.border = "1px dashed";
    dbgDiv.style.color = "white";
    dbgDiv.style.top = 10 + 'px';
    dbgDiv.style.left = 500 + 'px';
    document.body.appendChild(dbgDiv);

    function updateInfoDiv() {
        infoDiv.innerHTML= '<em><strong><font color="yellow" size="4">How to Navigate</font></strong></em>\
        </br>Left | Right = A | D\
        </br>Up | Down = W | S\
        </br>Zoom In | Out = +,E | -,Q\
        </br>Rotate = Left Click & Drag\
        </br></br><em><strong><font color="yellow" size="4">Settings</font></strong></em>\
        <table>\
        <tr><td>Dim1</td><td><select id="dim1"><option value="0">SELECT</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td></tr>\
        <tr><td>Dim2</td><td><select id="dim2"><option value="0">SELECT</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td></tr>\
        <tr><td>Dim3</td><td><select id="dim3"><option value="0">SELECT</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></td></tr>\
        <tr><td>Radius</td><td><input type="number" id="radius" min="0.005" max="0.1" step="0.005" value='+radius+'></td></tr>\
        </table>\
        <input type="submit" value="Re-Draw!" onclick="redraw();">';

        var infoTable='';
        for(var indLabel=0; indLabel<namesOfLabels.length; indLabel++){
            if(selectedIndex!=undefined){
                if(namesOfLabels[indLabel]=="Link"){
                    var link=globalPointsLabels[selectedIndex][indLabel];
                    if(mapid<=6){link='<a href="'+link+'" target="_blank">here</a>';}
                    infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>'+link+'</td></tr>';
                }else{
                    infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>'+globalPointsLabels[selectedIndex][indLabel]+'</td></tr>';   
                }          
            }else{
                infoTable=infoTable+'<tr><td>'+namesOfLabels[indLabel]+'</td><td>Undefined</td></tr>';
            }
        }
        pointInfoDiv.innerHTML= '<em><strong><font color="yellow" size="4">Point Info</font></strong></em><table border=>'+infoTable+'</table>';


        dbgDiv.innerHTML='Using v2 code for 3D MoDMap!</br>Back to main <a href="index.html"><font color="yellow">menu</font></a></br>'+minDistance;

        if((dim1>0)&&(dim2>0)&&(dim3>0)){
            document.getElementById("dim1").selectedIndex=dim1;
            document.getElementById("dim2").selectedIndex=dim2;
            document.getElementById("dim3").selectedIndex=dim3;
        }else{
            document.getElementById("dim1").selectedIndex=1;
            document.getElementById("dim2").selectedIndex=2;
            document.getElementById("dim3").selectedIndex=3;
        }
    }

    updateInfoDiv();

    function getDistanceSquare(p1, p2) {
        if (!p1 || !p2) return null;
        var dx = p1.x - p2.x;
        var dy = p1.y - p2.y;
        var dz = p1.z - p2.z;
        return dx * dx + dy * dy + dz * dz;
    }

    function updateSelectedMesh() {

        scene.remove(selectedMesh);
        selectedGeometry = new THREE.Geometry();
        var selectedCount = 0;

        if (selected1) {
            cloneGeometry(protoSelectedSphereGeometry, selectedGeometry, selected1, protoVertexCount * selectedCount);
            selectedCount++;
        }

        if (selected2) {
            cloneGeometry(protoSelectedSphereGeometry, selectedGeometry, selected2, protoVertexCount * selectedCount);
            selectedCount++;
        }

        selectedGeometry.computeFaceNormals();
        selectedMesh = new THREE.Mesh(selectedGeometry, selectedMaterial);
        selectedMesh.rotation.x = meshes[2].rotation.x;
        selectedMesh.rotation.y = meshes[2].rotation.y;
        scene.add(selectedMesh);
    }

    var canvas = document.getElementsByTagName('canvas')[0];
    var downx = 0, downxConst = 0;
    var downy = 0, downyConst = 0;
    var mouseIsDown = false;

    canvas.onmousedown = function(e){
        if (e.which != 1) return;
        downx = downxConst = e.clientX;
        downy = downyConst = e.clientY;
        mouseIsDown = true;
    }
    
    canvas.onmouseup = function(e){
        if (e.which != 1) return;
        mouseIsDown = false;
        mouse.x = ( e.clientX / canvas.width ) * 2 - 1;
        mouse.y = - ( e.clientY / canvas.height) * 2 + 1;
        
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        vector.unproject(camera);
        raycaster.set(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(scene.children);
            
        console.log("Found="+intersects.length+" intersections..");
        // for (var i2 = 0; i2 < intersects.length; i2 ++) {
        //     console.log("intersect["+i2+"]");
        //     var p=intersects[i2].point;
        //     var op = [p.x, p.y, p.z];
        //     var im = new THREE.Matrix4();
        //     im.getInverse(meshes[2].matrixWorld);
        //     im.applyToVector3Array(op);
        //     op = {x:op[0], y:op[1], z:op[2]};
        //     //console.log(op);
        //     var minDistance=100;
        //     for (var i3=0; i3< offsets.length; i3++){         
        //         var dist = getDistanceSquare(op, offsets[i3]);
        //         if (dist < minDistance) {
        //             minDistance = dist;
        //             minIndex = i3;
        //         }
        //     }
        //     console.log("des ti vrika!?!="+minIndex);
        // }

        if (intersects.length > 0 && downxConst == e.clientX && downyConst == e.clientY) {
            intersectedPoint= intersects[0].point;
            op = [intersectedPoint.x, intersectedPoint.y, intersectedPoint.z];
            var im = new THREE.Matrix4();
            im.getInverse(meshes[0].matrixWorld);
            im.applyToVector3Array(op);
            op = {x:op[0], y:op[1], z:op[2]};
            if(dbg){console.log(op);}

            // loop through all to find the point closer to the ray
            minDistance = getDistanceSquare(op, offsets[0]);
            var minIndex = 0;
            for (var i = 0; i < offsets.length; i ++) {
                var dist = getDistanceSquare(op, offsets[i]);
                if (dist < minDistance) {
                    minDistance = dist;
                    minIndex = i;
                }
            }
            selectedIndex=minIndex;
    
            op = {x:offsets[minIndex].x, y:offsets[minIndex].y, z:offsets[minIndex].z};
            console.log("Closest point is= "+minIndex);
            
            selected2 = selected1;
            selected1 = op;
            //// for disabling selection 
            updateSelectedMesh();
            updateInfoDiv();               
        }
    }

    canvas.onmousemove = function(e){
        if(!mouseIsDown) return;

        var dx = e.clientX - downx;
        var dy = e.clientY - downy;
        
        downx = e.clientX;
        downy = e.clientY;
        
        for(var i1=0; i1<meshes.length;i1++){
            
            meshes[i1].rotation.y += 0.005 * dx;
            
            while (meshes[i1].rotation.y > 2 * Math.PI) {
                meshes[i1].rotation.y -= 2 * Math.PI;
            }
            
            while (meshes[i1].rotation.y < -2 * Math.PI) {
                meshes[i1].rotation.y += 2 * Math.PI;
            }
            
            if ( (dy > 0 && meshes[i1].rotation.x < Math.PI/2) || 
                 (dy < 0 && meshes[i1].rotation.x > -Math.PI/2) ) {
                meshes[i1].rotation.x += 0.005 * dy;
            }
            
            selectedMesh.rotation.x = meshes[i1].rotation.x;
            selectedMesh.rotation.y = meshes[i1].rotation.y;
        }   
        return false;
    }
    
    document.onkeydown = function(e) {
        console.log(e.which);
        var d =0.1;
        // +- numpad  or eq
        if (e.which == 109 || e.which == 81) {camera.position.z += d;}
        if (e.which == 107 || e.which == 69) {camera.position.z -= d;}
        //wasd 87 65 83 68
        if (e.which == 87) {camera.position.y -= d;}
        if (e.which == 65) {camera.position.x += d;}
        if (e.which == 83) {camera.position.y += d;}
        if (e.which == 68) {camera.position.x -= d;}
    } 

    if(dbg){alert("endGraphics!");}

    for(var indtmp=0;indtmp<globalScaledPointsCoord.length;indtmp++){
    //console.log(indtmp);
        if(Math.abs(globalScaledPointsCoord[indtmp][0])>3.5){
            console.log(indtmp+" = "+globalScaledPointsCoord[indtmp][0]+" WHAAAAAAAAAAAAATTTT??");
        }
    }
}

function redraw(){
  dim1=document.getElementById("dim1").options[document.getElementById("dim1").selectedIndex].value;
  dim2=document.getElementById("dim2").options[document.getElementById("dim2").selectedIndex].value;
  dim3=document.getElementById("dim3").options[document.getElementById("dim3").selectedIndex].value;
  radius=parseFloat(document.getElementById("radius").value);
  if(dbg){alert("You selected: "+dim1+"-"+dim2+"-"+dim3+" and radius="+radius);}
  window.location="load.html?mapid="+mapid +"&dim1="+dim1+"&dim2="+dim2+"&dim3="+dim3+"&radius="+radius;  
}

function initialize() {
  if(dbg){alert("begin initialize..");}
  var res=alldata.split("\n");
  setOfPoints=res[0].split(','); 
  colors=res[1].split(',');  
  numberOfLabels=parseFloat(res[2]);
  namesOfLabels=res[3].split(',');
  legendColors=res[4].split(',');
  legendLabels=res[5].split(',');
    

  // read data from file
  globalScaledPointsCoord = new Array();
  globalPointsLabels = new Array();
  var tmpCoordsAllDims,centerX,centerY,centerZ;
  var pt_counter=-1;
  var dimensions=5;    //change 2 or 3 according to   2d or 3d plot
  for(var ind=6; ind<res.length;ind=ind+dimensions+numberOfLabels){
        pt_counter++;
        // for 2D
        //pointsCoord[pt_counter]=[res[ind],res[ind+1]];
        // for 5D
        tmpCoordsAllDims=[res[ind],res[ind+1],res[ind+2],res[ind+3],res[ind+4]];
        if((dim1>0)&&(dim2>0)&&(dim3>0)){
            centerX=parseFloat(tmpCoordsAllDims[dim1-1]);
            centerY=parseFloat(tmpCoordsAllDims[dim2-1]);
            centerZ=parseFloat(tmpCoordsAllDims[dim3-1]);
        }else{
            centerX=parseFloat(tmpCoordsAllDims[0]);
            centerY=parseFloat(tmpCoordsAllDims[1]);
            centerZ=parseFloat(tmpCoordsAllDims[2]);        
        }
        globalScaledPointsCoord[pt_counter]=[centerX,centerY,centerZ]; 

        globalPointsLabels[pt_counter]=[];
        for(var comm_ind=0;comm_ind<numberOfLabels;comm_ind++){
              globalPointsLabels[pt_counter].push(res[ind+dimensions+comm_ind]);
        }
  }

  // ALL DEBUG ALERTS
  if(dbg){
    alert("setofpoints="+setOfPoints);
    alert("colors="+colors);
    alert("#labels="+numberOfLabels);
    alert("namesLabels="+namesOfLabels);
    alert("legend_Colors="+legendColors);
    alert("legend_labels="+legendLabels);
    alert("globalPointsLabels="+globalPointsLabels);
  }

  if(dbg){alert("end initialization..");}
  initGraphics();
}

 
// MAYBE

//dbgDiv.innerHTML='Using v2 code for 3D MoDMap!</br>Back to main <a href="index.html"><font color="yellow">menu</font></a>';
//JSON.stringify(intersectedPoint);

// var titleInfo, titleInfoPart1, titleInfoPart2, titleInfoPart3;
//       var popupdata="";
//       var fcgrInfo, fromField, toField, pointToShow;
    


//NOT NEEDED ANYMORE


// getting centers of points
  //scaledPointsCoord = new Array();
  // var s=-1;
  // var centerX, centerY, centerZ;
  // for(var i=0; i<setOfPoints.length;i++){
  //   for(var j=0; j<parseFloat(setOfPoints[i]); j++){
  //     s++;
  //     if((geturlparamvalue("dim1")>0)&&(geturlparamvalue("dim2")>0)&&(geturlparamvalue("dim3")>0)){
  //       centerX=parseFloat(pointsCoord[s][geturlparamvalue("dim1")-1]);
  //       centerY=parseFloat(pointsCoord[s][geturlparamvalue("dim2")-1]);
  //       centerZ=parseFloat(pointsCoord[s][geturlparamvalue("dim3")-1]);
  //     }else{
  //       centerX=parseFloat(pointsCoord[s][0]);
  //       centerY=parseFloat(pointsCoord[s][1]);
  //       centerZ=parseFloat(pointsCoord[s][2]);        
  //     }
  //     scaledPointsCoord[s]=[centerX,centerY,centerZ];  
  //   }
  // }

  // globalScaledPointsCoord=scaledPointsCoord; 




    // function myPopup(e) {
    //     e.preventDefault();
    //     alert('asdf');
    //     return false;
    // }
    //renderer.domElement.addEventListener("contextmenu", myPopup);



    // function getDistance(p1, p2) {
    //     if (!p1 || !p2) return null;
    //     var dx = p1.x - p2.x;
    //     var dy = p1.y - p2.y;
    //     var dz = p1.z - p2.z;
    //     return Math.sqrt(dx * dx + dy * dy + dz * dz);
    // }

    
            // for ( var i = 0; i < intersects.length; i++ ) {
        //     intersects[ i ].object.material.color.set( 0xff0000 );
        // }
        // render();

        // var mindist=100;
        // for(var indInter=0; indInter<intersects.length;indInter++){
        //     intersectedPoint=intersects[indInter].point;
        //     console.log(intersectedPoint);
        //     for(var indPoint=0;indPoint<globalScaledPointsCoord.length;indPoint++){
        //         var dist=Math.sqrt(Math.pow(intersectedPoint["x"]-globalScaledPointsCoord[indPoint][0],2)+Math.pow(intersectedPoint["y"]-globalScaledPointsCoord[indPoint][1],2)+Math.pow(intersectedPoint["z"]-globalScaledPointsCoord[indPoint][2],2));
        //         //console.log(indPoint+"="+dist);
        //         if(dist<mindist){
        //             mindist=dist;
        //             var toLog=Math.round(mindist * 100) / 100;
        //             //dbgDiv.innerHTML=dbgDiv.innerHTML+"|("+indInter+","+indPoint+","+toLog+")";
        //             console.log("|("+indInter+","+indPoint+","+toLog+")");
        //         }  
        //     }
        //     //dbgDiv.innerHTML=dbgDiv.innerHTML+"-----";            
        // }



