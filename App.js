import React, {useEffect, useState} from "react";
import {SafeAreaView,View,Text,StyleSheet,ScrollView,TextInput,TouchableOpacity,Alert,ActivityIndicator} from "react-native";
import {StatusBar} from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import {supabase} from "./src/supabase";
import {getFeed,createPost,signOut} from "./src/api";
import {colors as C} from "./src/theme";

const demoPosts=[
 {id:"d1",author:{display_name:"Youssef El Amrani"},body:"كنقدم خدمات كهربائية وصيانة المنازل داخل المدينة.",created_at:"قبل ساعة"},
 {id:"d2",author:{display_name:"مريم السالمي"},body:"كنقلب على محل مناسب للكراء قريب من وسط المدينة.",created_at:"قبل ساعتين"},
 {id:"d3",author:{display_name:"Karim Services"},body:"تخفيض خاص على خدمات الصيانة هذا الأسبوع.",created_at:"قبل 3 ساعات"}
];

export default function App(){
 const [session,setSession]=useState(null),[tab,setTab]=useState("home"),[posts,setPosts]=useState(demoPosts);
 const [loading,setLoading]=useState(false),[body,setBody]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [mode,setMode]=useState("login"),[search,setSearch]=useState("");
 useEffect(()=>{ if(!supabase)return; supabase.auth.getSession().then(({data})=>setSession(data.session));
   const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{if(session) refresh()},[session]);
 async function refresh(){try{setLoading(true);const x=await getFeed();if(x.length)setPosts(x)}catch(e){Alert.alert("خطأ",e.message)}finally{setLoading(false)}}
 async function auth(){
   if(!supabase){Alert.alert("الإعداد ناقص","ربط Supabase من ملف .env أولا.");return}
   try{setLoading(true);
     if(mode==="login"){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error}
     else {const {error}=await supabase.auth.signUp({email,password});if(error)throw error;Alert.alert("تم","تفقد بريدك الإلكتروني لتأكيد الحساب.")}
   }catch(e){Alert.alert("خطأ",e.message)}finally{setLoading(false)}
 }
 async function publish(){
   if(!body.trim())return Alert.alert("QREB","كتب المنشور أولا.");
   try{setLoading(true); await createPost(body.trim()); setBody(""); setTab("home"); await refresh(); Alert.alert("تم","نشرنا المنشور بنجاح.")}catch(e){Alert.alert("خطأ",e.message)}finally{setLoading(false)}
 }
 async function pickImage(){await ImagePicker.requestMediaLibraryPermissionsAsync(); const r=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],quality:.8}); if(!r.canceled)Alert.alert("الصورة","اختيار الصورة حاضر، رفع Storage يتفعل بعد ربط Supabase Storage.");}
 if(!session && supabase) return <Auth email={email} setEmail={setEmail} password={password} setPassword={setPassword} mode={mode} setMode={setMode} auth={auth} loading={loading}/>;
 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
   <Header onProfile={()=>setTab("profile")}/>
   {tab==="home"&&<Home posts={posts} loading={loading} refresh={refresh}/>}
   {tab==="search"&&<Search search={search} setSearch={setSearch} posts={posts}/>}
   {tab==="publish"&&<Publish body={body} setBody={setBody} publish={publish} pickImage={pickImage} loading={loading}/>}
   {tab==="messages"&&<Messages/>}
   {tab==="profile"&&<Profile session={session} logout={async()=>{await signOut();setSession(null)}}/>}
   <Nav tab={tab} setTab={setTab}/>
 </SafeAreaView>
}

function Header({onProfile}){return <View style={s.header}><View><Text style={s.logo}>QREB</Text><Text style={s.tag}>قريب منك • خدمات • فرص</Text></View><TouchableOpacity style={s.avatar} onPress={onProfile}><Text style={s.avatarT}>م</Text></TouchableOpacity></View>}
function Home({posts,loading,refresh}){return <ScrollView contentContainerStyle={s.content}><View style={s.location}><Text style={s.locationTitle}>📍 المنطقة القريبة منك</Text><Text style={s.muted}>خدمات وفرص ومنشورات محلية</Text></View><Text style={s.title}>شنو واقع قريب منك؟</Text>{loading?<ActivityIndicator color={C.gold}/>:posts.map((p,i)=><View style={s.post} key={p.id||i}><View style={s.row}><View style={s.small}><Text style={s.smallT}>{(p.author?.display_name||"ق")[0]}</Text></View><View style={{flex:1}}><Text style={s.name}>{p.author?.display_name||"مستخدم QREB"}</Text><Text style={s.muted}>{p.created_at}</Text></View></View><Text style={s.postText}>{p.body}</Text><View style={s.actions}><Text style={s.action}>♡ إعجاب</Text><Text style={s.action}>💬 تعليق</Text><Text style={s.action}>↗ مشاركة</Text></View></View>)}<TouchableOpacity onPress={refresh}><Text style={s.refresh}>تحديث المنشورات</Text></TouchableOpacity></ScrollView>}
function Search({search,setSearch,posts}){let x=posts.filter(p=>(p.body||"").includes(search)||(p.author?.display_name||"").includes(search));return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>البحث</Text><TextInput value={search} onChangeText={setSearch} style={s.input} placeholder="خدمة، شخص، فرصة..." placeholderTextColor={C.muted}/>{x.map(p=><View style={s.post} key={p.id}><Text style={s.name}>{p.author?.display_name}</Text><Text style={s.postText}>{p.body}</Text></View>)}</ScrollView>}
function Publish({body,setBody,publish,pickImage,loading}){return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>نشر جديد</Text><View style={s.types}><Text style={s.type}>طلب</Text><Text style={s.type}>خدمة</Text><Text style={s.type}>عرض</Text></View><TextInput multiline value={body} onChangeText={setBody} style={[s.input,s.area]} placeholder="شنو بغيتي تنشر؟" placeholderTextColor={C.muted}/><TouchableOpacity style={s.secondary} onPress={pickImage}><Text style={s.secondaryT}>📷 إضافة صورة</Text></TouchableOpacity><TouchableOpacity style={s.primary} onPress={publish} disabled={loading}><Text style={s.primaryT}>{loading?"جاري النشر...":"نشر الآن"}</Text></TouchableOpacity></ScrollView>}
function Messages(){return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>الرسائل</Text>{["Sara El Idrissi","Omar Haddad","Amina Boulahcen","Karim Services"].map(n=><View style={s.message} key={n}><View style={s.small}><Text style={s.smallT}>{n[0]}</Text></View><View><Text style={s.name}>{n}</Text><Text style={s.muted}>مرحبا، كيف نقدر نعاونك؟</Text></View></View>)}</ScrollView>}
function Profile({session,logout}){return <ScrollView contentContainerStyle={s.content}><View style={s.profile}><View style={s.big}><Text style={s.bigT}>م</Text></View><Text style={s.profileName}>حساب QREB</Text><Text style={s.muted}>{session?.user?.email||"وضع التجربة"}</Text></View><TouchableOpacity style={s.menu}><Text style={s.menuT}>⭐ QREB Premium</Text></TouchableOpacity><TouchableOpacity style={s.menu}><Text style={s.menuT}>🛡 الأمان والخصوصية</Text></TouchableOpacity><TouchableOpacity style={s.menu}><Text style={s.menuT}>⚙ الإعدادات</Text></TouchableOpacity>{session&&<TouchableOpacity style={s.danger} onPress={logout}><Text style={s.dangerT}>تسجيل الخروج</Text></TouchableOpacity>}</ScrollView>}
function Auth(p){return <SafeAreaView style={s.safe}><View style={s.auth}><Text style={s.logo}>QREB</Text><Text style={s.tag}>قريب منك • خدمات • فرص</Text><Text style={s.title}>{p.mode==="login"?"تسجيل الدخول":"إنشاء حساب"}</Text><TextInput style={s.input} value={p.email} onChangeText={p.setEmail} placeholder="البريد الإلكتروني" placeholderTextColor={C.muted} autoCapitalize="none"/><TextInput style={s.input} value={p.password} onChangeText={p.setPassword} placeholder="كلمة المرور" placeholderTextColor={C.muted} secureTextEntry/><TouchableOpacity style={s.primary} onPress={p.auth}><Text style={s.primaryT}>{p.loading?"...":p.mode==="login"?"دخول":"إنشاء حساب"}</Text></TouchableOpacity><TouchableOpacity onPress={()=>p.setMode(p.mode==="login"?"signup":"login")}><Text style={s.switch}>{p.mode==="login"?"ما عندكش حساب؟ إنشاء حساب":"عندك حساب؟ تسجيل الدخول"}</Text></TouchableOpacity></View></SafeAreaView>}
function Nav({tab,setTab}){let a=[["home","⌂","الرئيسية"],["search","⌕","بحث"],["publish","＋","نشر"],["messages","✉","الرسائل"],["profile","◯","حسابي"]];return <View style={s.nav}>{a.map(x=><TouchableOpacity key={x[0]} onPress={()=>setTab(x[0])}><Text style={[s.navI,tab===x[0]&&s.active]}>{x[1]}</Text><Text style={[s.navL,tab===x[0]&&s.active]}>{x[2]}</Text></TouchableOpacity>)}</View>}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:C.bg},header:{height:78,padding:16,flexDirection:"row",justifyContent:"space-between",alignItems:"center",borderBottomWidth:1,borderBottomColor:C.line},
 logo:{fontSize:31,fontWeight:"900",color:C.gold,letterSpacing:2},tag:{fontSize:11,color:C.muted},avatar:{width:43,height:43,borderRadius:22,borderWidth:2,borderColor:C.gold,alignItems:"center",justifyContent:"center"},avatarT:{color:C.text,fontWeight:"900"},
 content:{padding:16,paddingBottom:105},location:{padding:16,backgroundColor:C.panel,borderRadius:18,borderWidth:1,borderColor:C.line,marginBottom:18},locationTitle:{color:C.text,fontSize:17,fontWeight:"800"},muted:{color:C.muted,fontSize:12,marginTop:3},title:{color:C.text,fontSize:23,fontWeight:"900",marginBottom:15},post:{backgroundColor:C.panel,borderRadius:18,borderWidth:1,borderColor:C.line,padding:15,marginBottom:12},row:{flexDirection:"row",alignItems:"center"},small:{width:40,height:40,borderRadius:20,backgroundColor:C.panel2,alignItems:"center",justifyContent:"center",marginRight:10},smallT:{color:C.gold,fontWeight:"900"},name:{color:C.text,fontWeight:"800",fontSize:14},postText:{color:"#E7ECF3",fontSize:15,lineHeight:23,marginTop:13},actions:{flexDirection:"row",gap:18,marginTop:14,paddingTop:12,borderTopWidth:1,borderTopColor:"#172A40"},action:{color:"#9AA8BB",fontSize:12},refresh:{color:C.gold,textAlign:"center",padding:12},input:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:14,padding:15,color:C.text,fontSize:15,marginBottom:13},area:{height:180,textAlignVertical:"top"},types:{flexDirection:"row",gap:8,marginBottom:13},type:{flex:1,textAlign:"center",padding:12,color:C.gold,backgroundColor:C.panel2,borderRadius:12,borderWidth:1,borderColor:C.line},primary:{backgroundColor:C.gold,padding:16,borderRadius:14,alignItems:"center",marginTop:12},primaryT:{color:C.bg,fontWeight:"900",fontSize:16},secondary:{padding:15,borderRadius:14,alignItems:"center",borderWidth:1,borderColor:C.line},secondaryT:{color:C.text,fontWeight:"800"},message:{backgroundColor:C.panel,padding:13,borderRadius:15,flexDirection:"row",alignItems:"center",marginBottom:9},profile:{backgroundColor:C.panel,padding:25,borderRadius:22,alignItems:"center",borderWidth:1,borderColor:C.line,marginBottom:12},big:{width:88,height:88,borderRadius:44,borderWidth:3,borderColor:C.gold,backgroundColor:C.panel2,alignItems:"center",justifyContent:"center"},bigT:{color:C.text,fontSize:35,fontWeight:"900"},profileName:{color:C.text,fontSize:21,fontWeight:"900",marginTop:10},menu:{padding:17,backgroundColor:C.panel,borderRadius:15,borderWidth:1,borderColor:C.line,marginBottom:9},menuT:{color:C.text,fontWeight:"800"},danger:{padding:16,alignItems:"center"},dangerT:{color:C.red,fontWeight:"800"},nav:{position:"absolute",left:0,right:0,bottom:0,height:82,backgroundColor:"#091524",borderTopWidth:1,borderTopColor:C.line,flexDirection:"row",justifyContent:"space-around",alignItems:"center"},navI:{color:"#74839A",fontSize:23,textAlign:"center"},navL:{color:"#74839A",fontSize:10,textAlign:"center"},active:{color:C.gold},auth:{flex:1,justifyContent:"center",padding:25},switch:{color:C.gold,textAlign:"center",marginTop:20,fontWeight:"800"}
});
