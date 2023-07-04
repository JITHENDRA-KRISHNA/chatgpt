API_KEY = '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';
function getCookie(name) {
  const cookieArr = document.cookie.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");
    if (name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}
let previousInput=' ';
function submitQuery() {
  const query = document.getElementById("fixinp").value;
  const token = getCookie("token");
  if (!token) {
    window.location.href = "/login";
    return;
  }
  else{
    if (query === previousInput) {
      return; 
    }
    previousInput = query;
const submitButton = document.querySelector('#submitbtn');
const outputContainer = document.querySelector('.right-section');
const inputElement = document.getElementById('fixinp');
const historyElement = document.querySelector('.left-section');
inputElement.addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    getMessage();
  }
});

submitButton.addEventListener('click', getMessage);
async function getMessage() {
  console.log('clicked');
  const input = inputElement.value.trim();

  if (input === '') {
    alert('Please enter something.');
    return;
  }
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: input }],
      max_tokens: 1000,
    }),
  };

  try {
    const loadingContainer = document.getElementById('loadingContainer');
    const gotext = document.getElementById('gotxt');
    gotext.style.display = 'none';
    loadingContainer.style.display = 'flex';
    const response = await fetch('https://api.openai.com/v1/chat/completions', options);
    const data = await response.json();
    console.log(data);
    const content = data.choices[0].message.content;
    const outputDiv = createOutputDiv(content, data);
    const userInputDiv = createUserInputDiv(input); 
    inputElement.value = '';
    outputContainer.appendChild(userInputDiv);
    outputContainer.appendChild(outputDiv);

    if (content) {
      const pElement = document.createElement('p');
      const histDiv = document.createElement('button');
      const createdValue = data.created;
      histDiv.setAttribute('id', createdValue);
      pElement.textContent = input;
      histDiv.style.width = '95%';
      histDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      histDiv.style.backdropFilter = 'blur(20px)';
      histDiv.style.marginTop = '10px';
      histDiv.appendChild(pElement);
      histDiv.style.padding = '3px';
      historyElement.appendChild(histDiv);
    }
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        const buttonId = this.getAttribute('id');
        pointdiv(buttonId);
      });
    });
  } catch (error) {
    console.error(error);
  }
}

function createUserInputDiv(input) {
  const userInputDiv = document.createElement('div');
  userInputDiv.style.display = 'flex';
  userInputDiv.style.flexDirection = 'row';
  userInputDiv.style.width = '90%';
  userInputDiv.style.wordWrap = 'break-word';
  userInputDiv.style.overflow = 'auto';
  userInputDiv.style.padding = '10px';
  userInputDiv.style.marginBottom = '10px';
  userInputDiv.style.marginLeft = '30px';
  userInputDiv.style.backgroundColor = 'rgb(169, 169, 169)';
  userInputDiv.style.borderTop = '4px solid green';
  
  const userButton = document.createElement('button');
  userButton.style.width = '50px';
  userButton.style.backgroundColor = 'green';
  userButton.style.color = 'white';
  userButton.style.textAlign = 'center';
  userButton.style.marginRight = '10px';
  userButton.style.display = 'inline-block';
  userButton.textContent = 'User';
  
  const userInputContent = document.createElement('p');
  userInputContent.textContent = input;

  userInputDiv.appendChild(userButton);
  userInputDiv.appendChild(userInputContent);

  return userInputDiv;
}

const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  button.addEventListener('click', function() {
    const buttonId = this.getAttribute('id');
    pointdiv(buttonId);
  });
});
let highlightedDivId = null; 


function pointdiv(id) {
  const div = outputContainer.querySelector(`div[id="${id}"]`);

  if (!div) {
    return;
  }
  const originalColor = div.style.backgroundColor;
  div.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  if (highlightedDivId) {
    const highlightedDiv = outputContainer.querySelector(`div[id="${highlightedDivId}"]`);
    if (highlightedDiv) {
      highlightedDiv.style.backgroundColor = originalColor;
    }
  }
  div.style.backgroundColor = 'yellow';
  highlightedDivId = id;
  setTimeout(() => {
    div.style.backgroundColor = originalColor;
  }, 500);
}



function createOutputDiv(content, data) {
  const loadingContainer = document.getElementById('loadingContainer');
  const gotext = document.getElementById('gotxt');
  gotext.style.display = 'block';
  loadingContainer.style.display = 'none';

  const outputDiv = document.createElement('div');
  outputDiv.style.position = 'relative';
  outputDiv.style.width = '90%';
  outputDiv.style.wordWrap = 'break-word';
  outputDiv.style.overflow = 'auto';
  outputDiv.style.padding = '10px';
  outputDiv.style.marginBottom = '10px';
  outputDiv.style.marginLeft = '30px';
  outputDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  outputDiv.style.borderBottom = '1px solid black';

  const aiButton = document.createElement('button');
  aiButton.style.width = '50px';
  aiButton.style.height = '50px';
  aiButton.style.backgroundColor = 'blue';
  aiButton.style.color = 'white';
  aiButton.style.textAlign = 'center';
  aiButton.textContent = 'AI';

  const code = extractCode(content);
  const codeElement = document.createElement('code');
  codeElement.className = 'language-python';
  codeElement.textContent = code;

  const preElement = document.createElement('pre');
  preElement.appendChild(codeElement);
  outputDiv.appendChild(aiButton);
  outputDiv.appendChild(preElement);

  if (isCodeContent(content)) {
    const copyButton = document.createElement('button');
    copyButton.style.position = 'absolute';
    copyButton.style.top = '0';
    copyButton.style.right = '0';
    copyButton.style.margin = '5px';
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => copyCode(content));
    outputDiv.appendChild(copyButton);
  }

  outputDiv.setAttribute('id', data.created);
  return outputDiv;
}



function executeCode() {
  const input = document.getElementById('fixinp').value;
  console.log('Processed input:', input);
}


function isCodeContent(content) {
  const codePattern = /```[\s\S]*?```/g;
  return codePattern.test(content);
}

function copyCode(content) {
  const code = extractCode(content);

  const tempElement = document.createElement('textarea');
  tempElement.value = code;
  document.body.appendChild(tempElement);
  tempElement.select();
  document.execCommand('copy');
  document.body.removeChild(tempElement);
}

function extractCode(content) {
  const codeRegex = /```python([\s\S]*)```/;
  const match = content.match(codeRegex);
  if (match && match.length >= 2) {
    return match[1].trim();
  }
  return content;
}

}
}