#docker-compose down &&
#docker image rm nodeapp:1 &&
#docker image rm mysql:8.0.35 &&
#docker image prune &&
#docker network prune

docker system prune -a &&
docker rm -f $(docker ps -aq) &&
docker rmi -f $(docker images -aq) &&
docker volume rm $(docker volume ls -q)