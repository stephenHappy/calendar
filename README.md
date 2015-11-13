# calendar

## how to invoke
`@import calendar.css`
`@import calendar.js`

Also U need an `<input readonly>` element , then bind the **click event** on it, like :

```javascript
    inputDom.onclick = function() {
        calendar({/* options here */});
    }

    options = {
        future: ture          // whether the future days can be selected or not
    }
```
