const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton =$messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#LocationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username,room }= Qs.parse(location.search,{ ignoreQueryPrefix:true })

$messageForm.addEventListener('submit',(e)=>{
	e.preventDefault()
	
	$messageFormButton.setAttribute('disabled','disabled')
	
	const message = e.target.elements.message.value
	
	socket.emit('sendMessage',message,(error)=>{

		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.value = ''
		$messageFormInput.focus()
		
		if(error){
			return console.log(error)
		}
		console.log("Message delivered")
	}) 	

})


const autoscroll = ()=>{
	const $newMessage =  $messages.lastElementChild
	const newMessageStyle = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyle.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	const visibleHeight = $messages.offsetHeight

	const containerHeight = $messages.scrollHeight

	const scrollOffset = $messages.scrollTop + visibleHeight

	if(containerHeight - newMessageHeight <= scrollOffset){

		$messages.scrollTop = $messages.scrollHeight

	}


}

socket.on('message',(message)=>{
	console.log(message)
	const html = Mustache.render(messageTemplate,{
		username:message.username,
		message:message.text,
		createdAt: moment(message.createdAt).format('h:mm a')

		

	})
	$messages.insertAdjacentHTML('beforeend',html)
	autoscroll() 
})

socket.on('locationMessage',(message)=>{
	
	const html = Mustache.render(locationMessageTemplate,{
		username:message.username,
		url: message.url,
		createdAt:moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend',html)
	autoscroll()
})

$sendLocationButton.addEventListener('click',()=>{
	
	if(!navigator.geolocation){
		return alert('geolocation is not supported by your browser')
	}

	$sendLocationButton.setAttribute('disabled','disabled')

	navigator.geolocation.getCurrentPosition((postion)=>{
		const latitude = postion.coords.latitude
		const longitude = postion.coords.longitude 
		socket.emit('sendLocation',{
			latitude,
			longitude
		},(message)=>{
			console.log(message)
			$sendLocationButton.removeAttribute('disabled')
		})
	})
})


socket.emit('join',{ username , room },(error)=>{
	if(error){
		alert(error)
		location.href = '/'
	}
})


socket.on('roomData',({ room, users})=>{

	const html = Mustache.render(sidebarTemplate,{
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
		
})