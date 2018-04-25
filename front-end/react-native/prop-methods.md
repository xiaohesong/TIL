- TextInput

  - onSubmitEditing
    
    [onSubmitEditing](https://facebook.github.io/react-native/docs/handling-text-input.html)。
    
  - onChangeText

    ```javascript
    import {TextInput} from 'react-native'
    const Example = props => {
      render(){
        renturn(
          <TextInput onChangeText={handleTextChange}></TextInput>
        )
      }
    }
    
    const handleTextChange = text => alert(`text: ${text}`)
    ```

可以看到 `onChangeText`,相当于`input onChange`.
