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
    getTime: function(date:Date):string{
        let hrsString:string = date.getHours() == 0 ? "12" : 
            date.getHours() < 12 ? String(date.getHours()) : String(date.getHours() - 12); 
        let amPm:string = date.getHours() < 12 ? "AM" : "PM";
        let minsString:string = String(date.getMinutes()).length<2 ? "0" + String(date.getMinutes()) : String(date.getMinutes()) 
        return `${hrsString}:${minsString} ${amPm}`;
    }
    
}

export default dateUtil; 