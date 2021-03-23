// Isso valida a informação inserida pelo usuário e inicia o movimento do bloco
function start()
{				
	if ((document.form1.length.value=="")||(document.form1.angle.value==""))
	{
		alert ("Valores não podem estar em branco");
		return false;
	}
	else if ((parseFloat(document.form2.Length.value)>=parseFloat(document.form1.length.value))||(parseFloat(document.form1.length.value)>2000))
	{
		alert ("length value must be in (Cuboid length (default 10),2000] ");
		return false;
	}
	else if ((parseFloat(document.form1.angle.value)<=0)||(parseFloat(document.form1.angle.value)>90))
	{
		alert ("Ângulo deve estar entre [0, 90]");
		return false;
	}
	else if ((parseFloat(document.form1.friction.value)<0))
	{
		alert ("Atrito deve ser um valor maior que 0 ");
		return false;
	}
	else if ((parseFloat(document.form2.dt.value)<=0)||(parseFloat(document.form2.dt.value)>100))
	{
		alert ("Ângulo deve ser um valor entre (0,100] ");
		return false;
	}
	else if ((parseFloat(document.form2.Length.value)<=0)||(parseFloat(document.form2.Length.value)>=parseFloat(document.form1.length.value)))
	{
		alert ("Comprimento deve estar entre (0, Comprimento do Plano) ");
		return false;
	}
	else if ((parseFloat(document.form2.Height.value)<0)||(parseFloat(document.form2.Height.value)>200))
	{
		alert ("Altura deve estar entre (0,200] ");
		return false;
	}
	else 
	{
		runAndDraw();
		return true;
	}
}

// Calcula e atualiza a posição do bloco após a próxima vez dt (selecionado pelo usuário, ou padrão 0,03s)
function nextPosition(dt)
{
	var frictionSign=null;
	this.number+=1;
	this.time=this.number*dt-0.0001;

	// O atrito funciona o oposto da reversão da velocidade
	if(this.vX>=0.0 && this.vY>=0.0) {
		frictionSign=1.0;
	}
	else if(this.vX<0.0 && this.vY<0.0) {
		frictionSign=-1.0;
	}

	// A aceleração devido ao atrito não deve exceder a aceleração do bloco
	if(this.frictionX>this.aX)
	this.frictionX=this.aX;
	if(this.frictionY>this.aY)
	this.frictionY=this.aY;

	// Atualização da posição e velocidade do bloco
	this.vX+=dt*(this.aX-frictionSign*this.frictionX);
	this.vY+=dt*(this.aY-frictionSign*this.frictionY);
	this.pX=this.startpX+((this.aX-frictionSign*this.frictionX)*this.time*this.time)/2.0;
	this.pY=this.startpY+((this.aY-frictionSign*this.frictionY)*this.time*this.time)/2.0;
}



// Uma flag que diz se o bloco está funcionando sem problemas
var cuboidSlidingDown= false;

// Isso ajuda a controlar o número de simulações em execução e desinstalação. O valor mínimo é 0 (atualmente não estamos exibindo a simulação), o valor máximo é 2 (estamos exibindo as simulações + solicitaremos uma nova simulação).
var numberOfTask=0;

var topX=0;
var topY=20;
function runAndDraw()      
{
	if(numberOfTask<=1)
	{
		++numberOfTask;
		const canvasElem = document.getElementById('canvas');
		const ctx = canvasElem.getContext('2d');
		const video = document.querySelector('video');
		
		const recordButton = document.querySelector('button#record');
		const playButton = document.querySelector('button#play');
		const downloadButton = document.querySelector('button#download');
		recordButton.onclick = toggleRecording;
		playButton.onclick = play;
		downloadButton.onclick = download;

const stream = canvas.captureStream(); // frames per second
console.log('Started stream capture from canvas element: ', stream);


		ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
		var length=parseFloat(document.form1.length.value);
		var angle=parseFloat(document.form1.angle.value);
		var friction=parseFloat(document.form1.friction.value);
		var dt=parseFloat(document.form2.dt.value);
		var rectLength=parseFloat(document.form2.Length.value);
		var rectHeight=parseFloat(document.form2.Height.value);
		var g =parseFloat(document.form3.g.value);
		var sina=Math.sin(angle*Math.PI/180.0);
		var cosa=Math.cos(angle*Math.PI/180.0);
		topY=rectHeight*cosa+20;
		canvasElem.height=length*sina+rectHeight*cosa+20;
		canvasElem.width=length*cosa+rectHeight*sina+20;
		var vX=0.0;
		var vY=0.0;

		var bottomX=topX+Math.cos(angle*Math.PI/180.0)*length;
		var bottomY=topY+Math.sin(angle*Math.PI/180.0)*length;

		var cuboid = new Cuboid(rectHeight,rectLength,topX,topY,vX,vY,g*sina*cosa,g*sina*sina,g*cosa*friction*cosa,g*cosa*friction*sina);
		cuboidSlidingDown=true;

		if(numberOfTask==1)
		{
			calcAndDrawNextPosition(bottomX,bottomY,angle,length,cuboid,ctx,canvasElem,dt);
			var interval=setInterval(function() {
				calcAndDrawNextPosition(bottomX,bottomY,angle,length,cuboid,ctx,canvasElem,dt);
				if(cuboid.pX >=bottomX- Math.cos(angle*Math.PI/180.0)*rectLength  || cuboid.pY >= bottomY- Math.sin(angle*Math.PI/180.0)*rectLength)
				{
					numberOfTask--;
					cuboidSlidingDown=false;
					clearInterval(interval);
				}

				if(numberOfTask>1)
				{
					--numberOfTask;
					clearInterval(interval);
					
					--numberOfTask;
					runAndDraw();
				}
			}
		, dt*1000);
		}

		function handleSourceOpen(event) {
			console.log('MediaSource opened');
			sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
			console.log('Source buffer: ', sourceBuffer);
		  }
		  
		  function handleDataAvailable(event) {
			if (event.data && event.data.size > 0) {
			  recordedBlobs.push(event.data);
			}
		  }
		  
		  function handleStop(event) {
			console.log('Recorder stopped: ', event);
			const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
			video.src = window.URL.createObjectURL(superBuffer);
		  }
		  
		  function toggleRecording() {
			if (recordButton.textContent === 'Iniciar Gravação') {
				recordButton.className = 'btn btn-danger';
				downloadButton.className = 'btn btn-secondary';
				playButton.className = 'btn btn-secondary';
			  startRecording();
			} else {
			  stopRecording();
			  //$(this).toggleClass('btn btn-warning');
			  recordButton.className = 'btn btn-warning';
			  recordButton.textContent = 'Iniciar Gravação';
			  downloadButton.className = 'btn btn-success';
			  playButton.className = 'btn btn-primary';
			  playButton.disabled = false;
			  downloadButton.disabled = false;
			}
		  }
		  
		  // The nested try blocks will be simplified when Chrome 47 moves to Stable
		  function startRecording() {
			let options = {mimeType: 'video/webm'};
			recordedBlobs = [];
			try {
			  mediaRecorder = new MediaRecorder(stream, options);
			} catch (e0) {
			  console.log('Unable to create MediaRecorder with options Object: ', e0);
			  try {
				options = {mimeType: 'video/webm,codecs=vp9'};
				mediaRecorder = new MediaRecorder(stream, options);
			  } catch (e1) {
				console.log('Unable to create MediaRecorder with options Object: ', e1);
				try {
				  options = 'video/vp8'; // Chrome 47
				  mediaRecorder = new MediaRecorder(stream, options);
				} catch (e2) {
				  alert('MediaRecorder is not supported by this browser.\n\n' +
					'Try Firefox 29 or later, or Chrome 47 or later, ' +
					'with Enable experimental Web Platform features enabled from chrome://flags.');
				  console.error('Exception while creating MediaRecorder:', e2);
				  return;
				}
			  }
			}
			console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
			recordButton.textContent = 'Parar Gravação';
			playButton.disabled = true;
			downloadButton.disabled = true;
			mediaRecorder.onstop = handleStop;
			mediaRecorder.ondataavailable = handleDataAvailable;
			mediaRecorder.start(100); // collect 100ms of data
			console.log('MediaRecorder started', mediaRecorder);
		  }
		  
		  function stopRecording() {
			mediaRecorder.stop();
			console.log('Recorded Blobs: ', recordedBlobs);
			video.controls = true;
		  }
		  
		  function play() {
			video.play();
		  }
		  
		  function download() {
			const blob = new Blob(recordedBlobs, {type: 'video/webm'});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'test.webm';
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
			  document.body.removeChild(a);
			  window.URL.revokeObjectURL(url);
			}, 100);
		  }
		  
	}
}

function calcAndDrawNextPosition(bottomX,bottomY,angle,length,cuboid,ctx,canvasElem,dt)
{
	var sina=Math.sin(angle*Math.PI/180.0);
	var cosa=Math.cos(angle*Math.PI/180.0);
	document.getElementById('parametersArticle').innerHTML="tempo: "+cuboid.time.toFixed(2)+" s"+"<br/>velocidade: "+Math.sqrt(cuboid.vX*cuboid.vX+cuboid.vY*cuboid.vY).toFixed(2)+" m/s"+"<br/>aceleração: "+Math.sqrt((cuboid.aX-cuboid.frictionX)*(cuboid.aX-cuboid.frictionX)+(cuboid.aY-cuboid.frictionY)*(cuboid.aY-cuboid.frictionY)).toFixed(2) + " m/s<sup>2</sup>"+"<br/>coeficiente máximo: "+((sina/cosa).toFixed(4));
	ctx.clearRect(0, 0, canvasElem.width, canvasElem.height);
	ctx.fillStyle="#3498db";
	ctx.beginPath();
	ctx.moveTo(topX,topY);
	ctx.lineTo(bottomX,bottomY);
	ctx.lineTo(topX,bottomY);
	ctx.fill();
	cuboid.drawCuboid(ctx,angle);
	cuboid.nextPosition(dt);
}

function showOptions()
{
	document.getElementById('advancedOptionsArticle').style.display= 'block';
	document.getElementById('advancedOptionsArticle2').style.display= 'block';
	document.getElementById('moreOptionsButton').style.display= 'none';
	document.getElementById('lessOptionsButton').style.display= 'inline-block';
}

function hideOptions()
{
	document.getElementById('advancedOptionsArticle').style.display= 'none';
	document.getElementById('advancedOptionsArticle2').style.display= 'none';
	document.getElementById('moreOptionsButton').style.display= 'inline-block';
	document.getElementById('lessOptionsButton').style.display= 'none';
}


// Isso representa um bloco que viaja ao longo do mesmo caminho
function Cuboid (height, width, positionX, positionY, velocityX, velocityY, accelerationX, accelerationY, frictionX, frictionY) 
{
	this.height = height;
	this.width = width;
	this.pX = positionX;
	this.pY = positionY;
	this.startpX=positionX;
	this.startpY=positionY;
	this.vX = velocityX;
	this.vY = velocityY;
	this.aX = accelerationX;
	this.aY = accelerationY;
	this.frictionX = frictionX;
	this.frictionY = frictionY;
	this.time=0.0;
	this.number=0;
	
	this.updateParameters=updateParameters;
	this.nextPosition=nextPosition;
	this.drawCuboid=drawCuboid;
}

// Desenha o Bloco
function drawCuboid(ctx,angle)
{
	ctx.fillStyle="#e74c3c";
	ctx.beginPath();
	ctx.moveTo(this.pX,this.pY);

	var nextX=this.pX+Math.cos(angle*Math.PI/180.0)*this.width;
	var nextY=this.pY+Math.sin(angle*Math.PI/180.0)*this.width;
	ctx.lineTo(nextX, nextY);
	nextX=nextX+Math.sin(angle*Math.PI/180.0)*this.height;
	nextY=nextY-Math.cos(angle*Math.PI/180.0)*this.height;
	ctx.lineTo(nextX, nextY);
	nextX=nextX-Math.cos(angle*Math.PI/180.0)*this.width;
	nextY=nextY-Math.sin(angle*Math.PI/180.0)*this.width;
	ctx.lineTo(nextX, nextY);					
	ctx.lineTo(this.pX, this.pY);
	ctx.fill();
}

// É usado para configuração de parâmetro manual, usado em testes, à esquerda no caso de o aplicativo ser estendido
function updateParameters(positionX=this.pX, positionY=this.pY, velocityX=this.vX, velocityY=this.vY, accelerationX=this.aX, accelerationY=this.aY, height=this.height, width=this.width, frictionX=this.frictionX, frictionY=this.frictionY, time=this.time) 
{
	this.height = height;
	this.width = width;
	this.pX = positionX;
	this.pY = positionY;
	this.vX = velocityX;
	this.vY = velocityY;
	this.aX = accelerationX;
	this.aY = accelerationY;
	this.frictionX = frictionX;
	this.frictionY = frictionY;
}