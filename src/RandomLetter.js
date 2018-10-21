export default function RandomLetter(){
    var frequencies = {
          'a': 8.167,
          'b': 1.492,
          'c': 2.782,
          'd': 4.253,
          'e': 12.702,
          'f': 2.228,
          'g': 2.015,
          'h': 6.094,
          'i': 6.966,
          'j': 0.153,
          'k': 0.772,
          'l': 4.025,
          'm': 2.406,
          'n': 6.749,
          'o': 7.507,
          'p': 1.929,
          'q': 0.095,
          'r': 5.987,
          's': 6.327,
          't': 9.056,
          'u': 2.758,
          'v': 0.978,
          'w': 2.360,
          'x': 0.150,
          'y': 1.974,
          'z': 0.074
      };
      var total = Object.keys(frequencies).map(function(l) {
          return frequencies[l];
      }).reduce(function(a, b) {
          return a + b;
      }); // This should add up to nearly 100%, but this way we don't have to assume that
      // This map/reduce pattern is common; you can read more about each at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map and https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce
  
  
      // Conceptually, we're setting up a line where different regions correspond to different letters; the length of the region is proportional to the frequency.  We're then going to grab a random number, look along the 'length' of our line, and find which region our random number lies in.  This means that more frequent letters occupy more of the line and are therefore more likely to be hit by our 'random number' dart.
      var random = Math.random() * total; // Choose a random number
  
      // And then find the region our random number corresponds to
      var sum = 0;
      for (var letter in frequencies) {
          if (random <= sum) {
              return letter;
          } else {
              sum += frequencies[letter];
          }
      }
  }