eyJrIjoiT1hhRGhSQlVCb0E2cDdqTVVjOFVxZUtEWGpXNUpjSEwiLCJuIjoic3VubGlnaHRBZG1pbiIsImlkIjoyfQ==

curl -H "Authorization: Bearer eyJrIjoiT1hhRGhSQlVCb0E2cDdqTVVjOFVxZUtEWGpXNUpjSEwiLCJuIjoic3VubGlnaHRBZG1pbiIsImlkIjoyfQ==" https://grafana.cloud-building.com/api/dashboards/home

curl -H "Authorization: Bearer eyJrIjoiT1hhRGhSQlVCb0E2cDdqTVVjOFVxZUtEWGpXNUpjSEwiLCJuIjoic3VubGlnaHRBZG1pbiIsImlkIjoyfQ==" https://grafana.cloud-building.com/api/search?query=&starred=false&skipRecent=true&skipStarred=true&folderIds=

superagent
.get(process.env.GRAFANAURL+'/api/search?query=&starred=false&skipRecent=true&skipStarred=true&folderIds=' + grafanaId + '&layout=folders&prevSort=null')
.set('Authorization', 'Bearer ' + grafanaToken)

https://grafana.cloud-building.com/public/views/gotoG.html?username=sunlightAdmin%40sunlight.com&password=123123&path=%2Fd%2FjqlzEJD7k%2Fiaq-monitoring&orgId=1

https://grafana.cloud-building.com/public/views/gotoG.html?username=sunlightAdmin%40sunlight.com&password=123123&path=%2Fd%2F-3SVG2e7z%2Fiaq-monitoring&orgId=2

# TODO:

- [*]: 视图模式 Panel Title 禁止下拉菜单
- [*]: 编辑模式
  - [*]: 设置按钮隐藏

# 查看模式

- http://localhost:3000/public/views/gotoG.html?username=admin&password=Mega%402022&path=%2Fd%2FOmaPZdS4k%2Fjoetest&orgId=1
- http://localhost:3000/d/OmaPZdS4k/joetest?m=i&theme=light&orgId=1

- http://localhost:3000/public/views/gotoG.html?username=admin&password=Mega%402022&path=%2Fd%2Fr_8tGlSVk%2Fjoetest&orgId=3
- http://localhost:3000/d/r_8tGlSVk/localhost-joe-test-2?orgId=3

- https://grafana-sandbox.cloud-building.com/public/views/gotoG.html?username=masikAdmin%40mega.com&password=123456&path=%2Fd%2F4PaDdtqnk%2F11&orgId=3

# 编辑模式

- http://localhost:3000/public/views/gotoG.html?username=admin&password=Mega%402022&path=%2Fd%2FOmaPZdS4k%2Fjoetest&orgId=1&type=edit
- http://localhost:3000/d/OmaPZdS4k/joetest?m=i&theme=light&orgId=1

- http://localhost:3000/public/views/gotoG.html?username=admin&password=Mega%402022&path=%2Fd%2Fr_8tGlSVk%2Fjoetest&orgId=3&type=edit
- http://localhost:3000/d/r_8tGlSVk/localhost-joe-test-2?orgId=3

- https://grafana-sandbox.cloud-building.com/public/views/gotoG.html?username=masikAdmin%40mega.com&password=123456&path=%2Fd%2F4PaDdtqnk%2F11&orgId=3&type=edit

# 本地开放环境

```bash
docker exec -it grafana8 sh

# /usr/share/grafana/public/views $ ls
# error-template.html  error.html           index-template.html  index.html
docker cp grafana8:/usr/share/grafana/public/views/index.html /Users/hemiao/joe/v3/grafana/public/views/localhost/arm/source

docker cp /Users/hemiao/joe/v3/grafana/public/views/loading-icon.svg grafana8:/usr/share/grafana/public/views
docker cp /Users/hemiao/joe/v3/grafana/public/views/joe-preload.js grafana8:/usr/share/grafana/public/views
docker cp /Users/hemiao/joe/v3/grafana/public/views/gotoG.html grafana8:/usr/share/grafana/public/views

docker cp /Users/hemiao/joe/v3/grafana/public/views/localhost/arm/target/index.html grafana8:/usr/share/grafana/public/views
```

# 线上沙盒环境

```bash
docker cp grafana8:/usr/share/grafana/public/views/extra.js /root/influxdb-docker/views/
docker cp grafana8:/usr/share/grafana/public/views/gotoG.html /root/influxdb-docker/views/
docker cp grafana8:/usr/share/grafana/public/views/index.html /root/influxdb-docker/views/

docker cp /root/influxdb-docker/views/joe-preload.js grafana8:/usr/share/grafana/public/views
docker cp /root/influxdb-docker/views/gotoG.html grafana8:/usr/share/grafana/public/views
docker cp /root/influxdb-docker/views/index.html grafana8:/usr/share/grafana/public/views
```

https://grafana-sandbox.cloud-building.com/public/views/gotoG.html?username=admin&password=Mega@2022&path=!d!4PaDdtqnk!11
https://grafana-sandbox.cloud-building.com/public/views/gotoG.html?username=admin&password=Mega@2022&path=!d!4PaDdtqnk!11&type=edit

# 线上正式环境
