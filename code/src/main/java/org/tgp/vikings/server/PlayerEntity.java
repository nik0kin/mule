package org.tgp.vikings.server;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import java.io.Serializable;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
@NamedQueries({
   @NamedQuery(name = "selectbyplayerid",
           query = "SELECT x FROM PlayerEntity x WHERE x.id=:someID"),
   @NamedQuery(name = "selectbyusername",
           query = "SELECT x FROM PlayerEntity x WHERE x.username=:someName"),
   @NamedQuery(name = "selectbytoken",
           query = "SELECT x FROM PlayerEntity x WHERE x.activeToken=:someToken")
})
@Table(name = "PLAYER_DIRECTORY")
public class PlayerEntity implements Serializable {

   private static final long serialVersionUID = 1L;
   @Id
   @GeneratedValue(strategy = GenerationType.AUTO)
   private int id;
   
   private String username;
   private String password;//NYI
   
   private String activeToken;

   public int getID() {
      return id;
   }

   public String getUsername(){ return username; }
   public void setUsername(String name){ username = name; }
   
   public String getActiveToken(){
      return activeToken;
   }
   public void setActiveToken(String token){
      activeToken = token;
   }

   @Override
   public String toString() {
      return "id=" + id + " username="+username+" activetoken="+activeToken;
   }
}