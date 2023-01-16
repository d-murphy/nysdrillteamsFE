type dayMap = { [dayNum: number]: string }

const dateUtil = {
    getDay: function(dayNum:number):string{
        const days:dayMap = {
            0: "Sunday", 
            1: "Monday", 
            2: "Tuesday", 
            3: "Wednesday", 
            4: "Thursday", 
            5: "Friday", 
            6: "Saturday"
        }
        return days[dayNum]; 
    },
    getMMDDYYYY: function(date:Date):string{
        date = new Date(date); 
        if(date) return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
        return ''; 
    },
    getYYYYMMDD: function(date:Date):string{
        date = new Date(date); 
        let dayString = String(date.getDate()).length < 2 ? `0${date.getDate()}` : date.getDate();  
        let monthString = String(date.getMonth()+1).length < 2 ? `0${date.getMonth()+1}` : date.getMonth()+1;  
        if(date) return `${date.getFullYear()}-${monthString}-${dayString}`;
        return ''; 
    },
    getTime: function(date:Date | string):string{
        if(!date) return ''; 
        if(date === "NULL") return ''; 
        //@ts-ignore
        if(! Date.parse(date) && date) return String(date); 
        //@ts-ignore
        return new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); 
    },
    getTimeForInput: function(date:Date):string{
        date = new Date(date); 
        if(isNaN(date.getTime())) return "12:00"; 
        let hourStr = String(date.getHours()).length < 2 ? `0${date.getHours()}` : `${date.getHours()}` 
        let minStr = String(date.getMinutes()).length < 2 ? `0${date.getMinutes()}` : `${date.getMinutes()}`
        return `${hourStr}:${minStr}`
    }
    
}

export default dateUtil; 