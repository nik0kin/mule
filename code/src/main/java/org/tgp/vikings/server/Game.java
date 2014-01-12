


package org.tgp.vikings.server;


import javax.enterprise.context.RequestScoped;

/**
 * This is a CDI bean that is used as a GameEntity holder.
 */
@RequestScoped
public class Game {

    private GameEntity gameEntity = null;

    /**
     * Retrieve the {@link GameEntity} object stored in this CDI bean
     *
     * @return {@link GameEntity} object stored in this CDI bean.
     */
    public GameEntity getGameEntity() {
        return gameEntity;
    }

    /**
     * Set {@link GameEntity} object once per http request so that it is available
     * seemlessly across all the web components in the scope of that http request.
     *
     * @param GameEntity {@link GameEntity} entity to be set.
     */
    public void setGameEntity(GameEntity gameEntity) {
        this.gameEntity = gameEntity;
    }

}
