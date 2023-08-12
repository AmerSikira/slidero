# Slidero

The only slider you'll ever need (just kidding) :sweat_smile:.

During my career I've seen many sliders and used many of them. One problem I had is that they either had tons of code, or they had complicated use.

So, this is my take on it.

I hope it will help at least one person.

If you have any question or ideas feel free to say so.

You can find simple example in index.html.

## Options

Here is the table with all options that Slidero offers.

| option            | type        | description                                                                                                                    |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| el                | HTMLElement | Pass an element from which contents you want to make a slider. E.g. document.getElementById("el") **the only required option** |
| elHeight          | string      | This function defines the height of slider holder. Default: '100vh'                                                            |
| autoPlay          | boolean     | Whether the slider will autoplay or not.Default: true                                                                          |
| autoPlaySpeed     | number      | How often will your slides change, time in milliseconds Default: 3000ms                                                        |
| navigation        | string[]    | The array of strings of the navigation you want for your slider. Currently ["arrows", "dots"]                                  |
| animationType     | string      | The type of animation that will run between slide change. Currently "zoom" and "fade". Default: '' (no animation)              |
| animationDuration | number      | How long will animation run. Default: 300ms                                                                                    |

## Interesting

You can create whatever animation you want and pass it to Slidero, it will rund it. The only requirement is that your entrance animation name ends in "In", while your leaving animation name ends in "Out".

Example:

```
      @keyframes maAnimationIn {
	from {
		transform: scale(0);
	}
	to {
		transform: scale(1);
	}
}

@keyframes myAnimationOut {
	from {
		transform: scale(1);
	}
	to {
		transform: scale(0);
	}
}
```

When you want to use your animation you just pass its name to options like:

```
new Slidero({
      ...
	animationType: "myAnimation",
      ...
});
```
