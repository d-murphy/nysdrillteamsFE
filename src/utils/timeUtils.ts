
const timeUtil = {
    niceTime: function(timeNum:number):string{
        let newTime = ''; 
        newTime += timeNum; 
        if(!newTime.includes('.')) newTime += '.00'; 
        let newTimeArr = newTime.split('.'); 
        if(newTimeArr[newTimeArr.length-1].length == 1) newTime += '0'
        return newTime; 
    }
}

export default timeUtil; 