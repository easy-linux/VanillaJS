import { getUserAvatarUrl } from "../tools";

export const createUser = (userData, lazyAvatar = false) => {
  const user = document.createElement("div");
  const avatarUrl = getUserAvatarUrl(userData.username);
  let avatar = `<img class="avatar" src="${avatarUrl}" ></img>`
  if(lazyAvatar){
    avatar = `<img class="avatar" data-src="${avatarUrl}" ></img>`
  }
  user.innerHTML = `
    <h2>${userData.name}</h2>
    <div class="user-info">
        <div>${avatar}</div>
        <div class="user-company">
            <h4>${userData.company.name}</h4>
            <div class="text">${userData.company.catchPhrase}</div>
            <div class="text">${userData.company.bs}</div>
        </div>
    </div>
    `;
  user.className = "user";
  return user;
};

/*
address
: 
{street: 'Kulas Light', suite: 'Apt. 556', city: 'Gwenborough', zipcode: '92998-3874', geo: {…}}
company
: 
{name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net', bs: 'harness real-time e-markets'}
email
: 
"Sincere@april.biz"
id
: 
1
name
: 
"Leanne Graham"
phone
: 
"1-770-736-8031 x56442"
username
: 
"Bret"
website
: 
"hildegard.org"*/
