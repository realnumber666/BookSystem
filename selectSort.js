function selectSort(arr){
        for(var i = 0; i < arr.length - 1; i++){
            var min = arr[i];
            for(var j = i + 1; j < arr.length - 1; j++){
                if(min > arr[j]){
                    var temp = min;
                    min = arr[j];
                    arr[j] = temp;
                }
            }
            arr[i] = min;
        }
        return arr;
    }