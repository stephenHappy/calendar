# calendar

## how to invoke
`@import calendar.css`
`@import calendar.js`

Also U need an `<input readonly>` element, and create the calendar like :

```javascript
    var myCalendar = new Calendar({
            id: '#id-selector',     // required!
            callback: function(date) {
                // date is the calendar result
            }
        })
```

Run `gulp` to change c.js into `es5`